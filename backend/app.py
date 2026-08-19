import json, re, traceback, sqlite3, hashlib, os
import requests
from datetime import datetime, timezone
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import PyPDF2

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "https://job-genie-tan.vercel.app"])

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
JSEARCH_KEY  = os.environ.get("JSEARCH_KEY", "")
JSEARCH_URL  = "https://jsearch.p.rapidapi.com/search"
DB_PATH      = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jobgenie.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))")
    conn.execute("CREATE TABLE IF NOT EXISTS profiles (user_id INTEGER PRIMARY KEY, phone TEXT DEFAULT '', location TEXT DEFAULT '', bio TEXT DEFAULT '', degree TEXT DEFAULT '', college TEXT DEFAULT '', graduation_year TEXT DEFAULT '', job_title TEXT DEFAULT '', experience TEXT DEFAULT '', interests TEXT DEFAULT '[]', resume_name TEXT DEFAULT '', avatar TEXT DEFAULT '', updated_at TEXT DEFAULT (datetime('now')))")
    conn.execute("CREATE TABLE IF NOT EXISTS resume_analyses (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, filename TEXT, score INTEGER, skills TEXT DEFAULT '[]', skill_gaps TEXT DEFAULT '[]', suggestions TEXT DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')))")
    conn.commit()
    conn.close()
    print("DB ready")

init_db()
print("Backend ready")

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db: db.close()

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()


@app.route("/admin/users", methods=["GET"])
def admin_users():
    db = get_db()
    users = db.execute("SELECT id, name, username, email, created_at FROM users ORDER BY created_at DESC").fetchall()
    return jsonify([dict(u) for u in users]), 200
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "running", "db": "SQLite"})

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    username = (data.get("username") or "").strip().lower()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    if not all([name, username, email, password]):
        return jsonify({"error": "All fields required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    db = get_db()
    try:
        db.execute("INSERT INTO users (name, username, email, password) VALUES (?,?,?,?)", (name, username, email, hash_pw(password)))
        db.commit()
        user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        db.execute("INSERT OR IGNORE INTO profiles (user_id) VALUES (?)", (user["id"],))
        db.commit()
        return jsonify({"id": user["id"], "name": user["name"], "username": user["username"], "email": user["email"]}), 201
    except sqlite3.IntegrityError as e:
        msg = "Username already taken" if "username" in str(e) else "Email already registered"
        return jsonify({"error": msg}), 409

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    pw = (data.get("password") or "").strip()
    if not email or not pw:
        return jsonify({"error": "Email and password required"}), 400
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=? AND password=?", (email, hash_pw(pw))).fetchone()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    db.execute("INSERT OR IGNORE INTO profiles (user_id) VALUES (?)", (user["id"],))
    db.commit()
    return jsonify({"id": user["id"], "name": user["name"], "username": user["username"], "email": user["email"]}), 200

@app.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    db = get_db()
    row = db.execute("SELECT * FROM profiles WHERE user_id=?", (user_id,)).fetchone()
    if not row:
        return jsonify({"error": "Profile not found"}), 404
    p = dict(row)
    p["interests"] = json.loads(p.get("interests") or "[]")
    return jsonify(p), 200

@app.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    data = request.get_json()
    db = get_db()
    db.execute("INSERT INTO profiles (user_id,phone,location,bio,degree,college,graduation_year,job_title,experience,interests,resume_name,avatar,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(user_id) DO UPDATE SET phone=excluded.phone,location=excluded.location,bio=excluded.bio,degree=excluded.degree,college=excluded.college,graduation_year=excluded.graduation_year,job_title=excluded.job_title,experience=excluded.experience,interests=excluded.interests,resume_name=excluded.resume_name,avatar=excluded.avatar,updated_at=excluded.updated_at",
        (user_id, data.get("phone",""), data.get("location",""), data.get("bio",""), data.get("degree",""), data.get("college",""), data.get("graduationYear",""), data.get("jobTitle",""), data.get("experience",""), json.dumps(data.get("interests",[])), data.get("resumeName",""), data.get("avatar","")))
    db.commit()
    return jsonify({"success": True}), 200

def extract_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t: text += t + "\n"
    return re.sub(r"\s+", " ", text).strip()

def ask_groq(text):
    prompt = "Analyze this resume. Return ONLY raw JSON, no markdown.\nFormat:\n{\"skills\":[],\"job_titles\":[],\"skill_gaps\":[],\"resume_score\":75,\"suggestions\":[]}\nRules: resume_score 0-100, ONLY JSON.\nResume:\n" + text[:4000]
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "llama3-70b-8192", "messages": [{"role": "user", "content": prompt}], "temperature": 0.3, "max_tokens": 1024}
    resp = requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
    if resp.status_code != 200:
        raise Exception(f"Groq {resp.status_code}: {resp.text[:200]}")
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw).strip()
    raw = re.sub(r"\s*```$", "", raw).strip()
    data = json.loads(raw)
    data["resume_score"] = int(data.get("resume_score", 70))
    return data

def format_posted(s):
    if not s: return "Today"
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        days = (datetime.now(timezone.utc) - dt).days
        if days == 0: return "Today"
        if days == 1: return "Yesterday"
        return f"{days} days ago"
    except: return s[:10]

def fetch_jobs(job_titles, location="India", experience=""):
    all_jobs = []
    headers = {"X-RapidAPI-Key": JSEARCH_KEY, "X-RapidAPI-Host": "jsearch.p.rapidapi.com"}
    loc_q = location if "india" in location.lower() else f"{location}, India"
    for title in job_titles[:4]:
        try:
            resp = requests.get(JSEARCH_URL, headers=headers, params={"query": f"{title} {loc_q}", "num_pages": "1", "page": "1", "date_posted": "month", "country": "in"}, timeout=10)
            if resp.status_code != 200: continue
            for j in resp.json().get("data", []):
                ps = j.get("job_posted_at_datetime_utc") or ""
                parts = [p for p in [j.get("job_city",""), j.get("job_state",""), j.get("job_country","")] if p]
                all_jobs.append({"role": j.get("job_title", title), "company": j.get("employer_name","Company"), "location": ", ".join(parts) if parts else location, "work_type": "Remote" if j.get("job_is_remote") else "On-site", "employment_type": j.get("job_employment_type","Full-time"), "description": (j.get("job_description") or "")[:150]+"...", "apply_link": j.get("job_apply_link","https://linkedin.com/jobs"), "source": j.get("job_publisher","LinkedIn"), "posted": format_posted(ps)})
                if len(all_jobs) >= 2: break
        except Exception as e:
            print(f"JSearch error: {e}")
    if not all_jobs:
        portals = [("LinkedIn","https://www.linkedin.com/jobs/search/?keywords={}"),("Indeed","https://in.indeed.com/jobs?q={}"),("Naukri","https://www.naukri.com/{}-jobs"),("Glassdoor","https://www.glassdoor.co.in/Job/{}-jobs-SRCH_KO0,20.htm"),("Internshala","https://internshala.com/jobs/{}")]
        locs = ["Bangalore, Karnataka, India","Mumbai, Maharashtra, India","Hyderabad, Telangana, India","Chennai, Tamil Nadu, India","Pune, Maharashtra, India"]
        for i, title in enumerate(job_titles):
            slug = title.lower().replace(" ","-")
            src, link = portals[i % len(portals)]
            all_jobs.append({"role": title, "company": "Multiple Companies", "location": locs[i % len(locs)], "work_type": ["Remote","On-site","Hybrid"][i%3], "employment_type": "Full-time", "description": f"Explore {title} opportunities.", "apply_link": link.format(slug), "source": src, "posted": "Today"})
    return all_jobs

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files["file"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "PDF only"}), 400
    user_id = request.form.get("user_id")
    location = request.form.get("location", "India")
    experience = request.form.get("experience", "")
    domain = request.form.get("domain", "")
    try:
        text = extract_pdf(file)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if len(text) < 50:
        return jsonify({"error": "Could not extract text."}), 400
    try:
        analysis = ask_groq(text)
        job_titles = analysis.pop("job_titles", ["Software Engineer"])
        if domain:
            job_titles = [f"{domain} {t}" if domain.lower() not in t.lower() else t for t in job_titles]
        if user_id:
            db = get_db()
            db.execute("INSERT INTO resume_analyses (user_id,filename,score,skills,skill_gaps,suggestions) VALUES (?,?,?,?,?,?)", (int(user_id), file.filename, analysis.get("resume_score",0), json.dumps(analysis.get("skills",[])), json.dumps(analysis.get("skill_gaps",[])), json.dumps(analysis.get("suggestions",[]))))
            db.commit()
        analysis["recommended_jobs"] = fetch_jobs(job_titles, location, experience)
        return jsonify(analysis), 200
    except Exception:
        print(traceback.format_exc())
        return jsonify({"error": "Analysis failed."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=False)