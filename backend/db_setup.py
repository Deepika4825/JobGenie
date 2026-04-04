"""Run once: python db_setup.py"""
import sqlite3, os

DB = os.path.join(os.path.dirname(__file__), "jobgenie.db")

conn = sqlite3.connect(DB)
c = conn.cursor()

c.executescript("""
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    username    TEXT    UNIQUE NOT NULL,
    email       TEXT    UNIQUE NOT NULL,
    password    TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id         INTEGER PRIMARY KEY REFERENCES users(id),
    phone           TEXT DEFAULT '',
    location        TEXT DEFAULT '',
    bio             TEXT DEFAULT '',
    degree          TEXT DEFAULT '',
    college         TEXT DEFAULT '',
    graduation_year TEXT DEFAULT '',
    job_title       TEXT DEFAULT '',
    experience      TEXT DEFAULT '',
    interests       TEXT DEFAULT '[]',
    resume_name     TEXT DEFAULT '',
    avatar          TEXT DEFAULT '',
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resume_analyses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id),
    filename    TEXT,
    score       INTEGER,
    skills      TEXT DEFAULT '[]',
    skill_gaps  TEXT DEFAULT '[]',
    suggestions TEXT DEFAULT '[]',
    created_at  TEXT DEFAULT (datetime('now'))
);
""")

conn.commit()
conn.close()
print("Database created:", DB)
