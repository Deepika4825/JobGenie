from dotenv import load_dotenv
load_dotenv()
import json, re, traceback
import requests
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL      = "https://api.groq.com/openai/v1/chat/completions"
JSEARCH_KEY  = os.environ.get("JSEARCH_KEY", "")
JSEARCH_URL   = "https://jsearch.p.rapidapi.com/search"
print("Backend ready")


# ── PDF extraction ────────────────────────────────────────────────────────────
def extract_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t + "\n"
    return re.sub(r"\s+", " ", text).strip()


# ── Groq analysis ─────────────────────────────────────────────────────────────
def ask_groq(text):
    prompt = (
        "Analyze this resume. Return ONLY raw JSON, no markdown.\n\n"
        'Format:\n{\n'
        '  "skills": ["real skills from resume"],\n'
        '  "job_titles": ["3-5 job titles matching this resume"],\n'
        '  "skill_gaps": ["missing skills"],\n'
        '  "resume_score": 75,\n'
        '  "suggestions": ["specific tips"]\n}\n\n'
        "Rules: resume_score 0-100, ONLY JSON.\n\nResume:\n" + text[:4000]
    )
    headers  = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload  = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1024
    }
    resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
    if resp.status_code != 200:
        raise Exception(f"Groq {resp.status_code}: {resp.text[:200]}")
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw).strip()
    raw = re.sub(r"\s*```$",          "", raw).strip()
    data = json.loads(raw)
    data["resume_score"] = int(data.get("resume_score", 70))
    return data


# ── JSearch real jobs ─────────────────────────────────────────────────────────
def days_ago(posted_str):
    if not posted_str:
        return "Today"
    try:
        dt   = datetime.fromisoformat(posted_str.replace("Z", "+00:00"))
        days = (datetime.now(timezone.utc) - dt).days
        if days == 0:  return "Today"
        if days == 1:  return "Yesterday"
        return f"{days} days ago"
    except:
        return posted_str[:10]


def fetch_jobs(job_titles):
    all_jobs = []
    headers  = {
        "X-RapidAPI-Key":  JSEARCH_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    for title in job_titles[:4]:
        try:
            resp = requests.get(
                JSEARCH_URL,
                headers=headers,
                params={
                    "query":       title,
                    "num_pages":   "1",
                    "page":        "1",
                    "date_posted": "month"
                },
                timeout=10
            )
            print(f"JSearch [{title}] status: {resp.status_code}")
            if resp.status_code != 200:
                continue
            jobs = resp.json().get("data", [])
            for j in jobs:
                posted_str = j.get("job_posted_at_datetime_utc") or ""
                # skip jobs older than 30 days
                if posted_str:
                    try:
                        dt = datetime.fromisoformat(posted_str.replace("Z", "+00:00"))
                        if (datetime.now(timezone.utc) - dt).days > 30:
                            continue
                    except:
                        pass
                city    = j.get("job_city")    or ""
                state   = j.get("job_state")   or ""
                country = j.get("job_country") or ""
                parts   = [p for p in [city, state, country] if p]
                location = ", ".join(parts) if parts else "India"
                all_jobs.append({
                    "role":             j.get("job_title",            title),
                    "company":          j.get("employer_name",        "Company"),
                    "location":         location,
                    "work_type":        "Remote" if j.get("job_is_remote") else "On-site",
                    "employment_type":  j.get("job_employment_type",  "Full-time"),
                    "description":      (j.get("job_description") or "")[:150] + "...",
                    "apply_link":       j.get("job_apply_link",       "https://linkedin.com/jobs"),
                    "source":           j.get("job_publisher",        "LinkedIn"),
                    "posted":           days_ago(posted_str)
                })
                if len(all_jobs) >= 2:
                    break
        except Exception as e:
            print(f"JSearch error [{title}]:", e)

    return all_jobs if all_jobs else fallback_jobs(job_titles)


# ── Fallback when JSearch fails ───────────────────────────────────────────────
def fallback_jobs(job_titles):
    portals = [
        ("LinkedIn",    "https://www.linkedin.com/jobs/search/?keywords={}"),
        ("Indeed",      "https://www.indeed.com/jobs?q={}"),
        ("Naukri",      "https://www.naukri.com/{}-jobs"),
        ("Glassdoor",   "https://www.glassdoor.com/Job/{}-jobs-SRCH_KO0,20.htm"),
        ("Internshala", "https://internshala.com/jobs/{}"),
    ]
    locations = [
        "Bangalore, Karnataka, India",
        "Mumbai, Maharashtra, India",
        "Hyderabad, Telangana, India",
        "Chennai, Tamil Nadu, India",
        "Pune, Maharashtra, India",
    ]
    work_types = ["Remote", "On-site", "Hybrid", "Remote", "On-site"]
    jobs = []
    for i, title in enumerate(job_titles):
        slug         = title.lower().replace(" ", "-")
        source, link = portals[i % len(portals)]
        jobs.append({
            "role":            title,
            "company":         "Multiple Companies",
            "location":        locations[i % len(locations)],
            "work_type":       work_types[i % len(work_types)],
            "employment_type": "Full-time",
            "description":     f"Explore {title} opportunities matching your resume skills.",
            "apply_link":      link.format(slug),
            "source":          source,
            "posted":          "Today"
        })
    return jobs


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "running"})


@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files["file"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "PDF only"}), 400
    try:
        text = extract_pdf(file)
        print(f"Extracted {len(text)} chars")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if len(text) < 50:
        return jsonify({"error": "Could not extract text."}), 400
    try:
        analysis   = ask_groq(text)
        job_titles = analysis.pop("job_titles", ["Software Engineer"])
        print("Score:", analysis.get("resume_score"), "| Titles:", job_titles)
        analysis["recommended_jobs"] = fetch_jobs(job_titles)
        return jsonify(analysis), 200
    except Exception:
        print(traceback.format_exc())
        return jsonify({"error": "Analysis failed."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=False)
