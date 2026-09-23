"""
PlacePilot - SQLite Database Access Layer.

All database access across the application passes strictly through this file.
Uses plain SQLite functions without heavy ORMs to keep the code clear, robust,
and explainable in under a minute per function.
"""

import datetime
import json
import os
import sqlite3
import uuid
from typing import Any, Dict, List, Optional

# Path to SQLite database file
DB_PATH = os.path.join(os.path.dirname(__file__), "placepilot.db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def get_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with dict-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initializes the 5 required SQLite tables if they do not already exist."""
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Postings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS postings (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT NOT NULL,
                skills TEXT NOT NULL,
                stipend TEXT NOT NULL,
                deadline TEXT NOT NULL,
                embedding TEXT
            )
        """)

        # 2. Resumes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                raw_text TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                education TEXT NOT NULL,
                experience_summary TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 3. Applications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                posting_id TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                date TEXT NOT NULL
            )
        """)

        # 4. History table (audit log)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                action_type TEXT NOT NULL,
                detail TEXT NOT NULL
            )
        """)

        # 5. Knowledge docs table (career knowledge base RAG)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_docs (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                content TEXT NOT NULL,
                embedding TEXT
            )
        """)
        conn.commit()


def seed_postings_if_empty(embed_fn=None) -> int:
    """Seeds postings from backend/data/postings_seed.json if the table is currently empty."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM postings")
        count = cursor.fetchone()["count"]
        if count > 0:
            return count

        seed_file = os.path.join(DATA_DIR, "postings_seed.json")
        if not os.path.exists(seed_file):
            return 0

        with open(seed_file, "r", encoding="utf-8") as f:
            postings_data = json.load(f)

        for p in postings_data:
            text_for_embed = f"{p['title']} at {p['company']}. {p['description']} Skills: {p['skills']}"
            embedding_json = json.dumps(embed_fn(text_for_embed)) if embed_fn else None

            cursor.execute("""
                INSERT OR IGNORE INTO postings (id, title, company, location, description, skills, stipend, deadline, embedding)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"],
                p["title"],
                p["company"],
                p["location"],
                p["description"],
                p["skills"],
                p["stipend"],
                p["deadline"],
                embedding_json
            ))
        conn.commit()
        return len(postings_data)


def seed_knowledge_docs_if_empty(embed_fn=None) -> int:
    """Seeds knowledge base documents from backend/data/knowledge_base/*.md if table is empty."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM knowledge_docs")
        count = cursor.fetchone()["count"]
        if count > 0:
            return count

        kb_dir = os.path.join(DATA_DIR, "knowledge_base")
        if not os.path.exists(kb_dir):
            return 0

        inserted = 0
        for filename in sorted(os.listdir(kb_dir)):
            if filename.endswith(".md"):
                filepath = os.path.join(kb_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                doc_id = str(uuid.uuid4())
                embedding_json = json.dumps(embed_fn(content)) if embed_fn else None

                cursor.execute("""
                    INSERT INTO knowledge_docs (id, filename, content, embedding)
                    VALUES (?, ?, ?, ?)
                """, (doc_id, filename, content, embedding_json))
                inserted += 1

        conn.commit()
        return inserted


# --- Postings Operations ---

def get_postings() -> List[Dict[str, Any]]:
    """Retrieves all internship postings."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM postings ORDER BY id ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_posting_by_id(posting_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single posting by its ID."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM postings WHERE id = ?", (posting_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def update_posting_embedding(posting_id: str, embedding: List[float]) -> None:
    """Updates the embedding vector for a given posting."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE postings SET embedding = ? WHERE id = ?", (json.dumps(embedding), posting_id))
        conn.commit()


# --- Resumes Operations ---

def save_resume(raw_text: str, skills_json: str, education: str, experience_summary: str) -> str:
    """Saves a parsed resume and returns the new resume ID."""
    resume_id = str(uuid.uuid4())
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO resumes (id, raw_text, skills_json, education, experience_summary)
            VALUES (?, ?, ?, ?, ?)
        """, (resume_id, raw_text, skills_json, education, experience_summary))
        conn.commit()
    return resume_id


def get_latest_resume() -> Optional[Dict[str, Any]]:
    """Retrieves the most recently saved resume record."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resumes ORDER BY created_at DESC LIMIT 1")
        row = cursor.fetchone()
        return dict(row) if row else None


# --- Applications Operations ---

def get_applications() -> List[Dict[str, Any]]:
    """Retrieves all tracked applications joined with posting details."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                a.id, a.posting_id, a.status, a.date,
                p.title as posting_title, p.company as posting_company,
                p.location as posting_location, p.stipend as posting_stipend
            FROM applications a
            LEFT JOIN postings p ON a.posting_id = p.id
            ORDER BY a.date DESC
        """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def save_or_update_application(posting_id: str, status: str) -> Dict[str, Any]:
    """
    Inserts a new application or updates an existing status for posting_id.
    Prevents duplicate rows for the same posting.
    """
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM applications WHERE posting_id = ?", (posting_id,))
        existing = cursor.fetchone()

        if existing:
            app_id = existing["id"]
            cursor.execute("UPDATE applications SET status = ?, date = ? WHERE id = ?", (status, now, app_id))
        else:
            app_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO applications (id, posting_id, status, date)
                VALUES (?, ?, ?, ?)
            """, (app_id, posting_id, status, now))
        conn.commit()

        cursor.execute("""
            SELECT a.id, a.posting_id, a.status, a.date, p.title as posting_title, p.company as posting_company
            FROM applications a
            LEFT JOIN postings p ON a.posting_id = p.id
            WHERE a.id = ?
        """, (app_id,))
        row = cursor.fetchone()
        return dict(row) if row else {"id": app_id, "posting_id": posting_id, "status": status, "date": now}


# --- History Operations ---

def log_history_entry(agent_name: str, action_type: str, detail: str) -> int:
    """Inserts a structured audit log into the history table."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO history (timestamp, agent_name, action_type, detail)
            VALUES (?, ?, ?, ?)
        """, (now, agent_name, action_type, detail))
        conn.commit()
        return cursor.lastrowid or 0


def get_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent agent action history."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM history ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


# --- Knowledge Docs Operations ---

def get_knowledge_docs() -> List[Dict[str, Any]]:
    """Retrieves all knowledge base documents."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_docs ORDER BY filename ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def update_knowledge_doc_embedding(doc_id: str, embedding: List[float]) -> None:
    """Updates the embedding vector for a given knowledge document."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE knowledge_docs SET embedding = ? WHERE id = ?", (json.dumps(embedding), doc_id))
        conn.commit()
