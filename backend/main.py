"""
PlacePilot - FastAPI Application Server.

Exposes the five core REST API endpoints:
  - POST /orchestrate: Runs the multi-agent discovery and drafting pipeline
  - POST /applications/{id}/approve: Marks a draft as applied via the Tracker Agent
  - GET /applications: Returns current tracked application statuses
  - POST /resume/upload: Parses uploaded PDF or raw text via the Resume Parser Agent
  - POST /chat: Domain-restricted Q&A grounded in career knowledge docs via Chatbot Agent
"""

import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.agents.chatbot import answer_question
from backend.agents.drafting_tracker import track_application
from backend.agents.orchestrator import orchestrate
from backend.agents.resume_parser import parse_resume
from backend.db import (
    get_applications,
    get_history,
    get_postings,
    init_db,
    seed_knowledge_docs_if_empty,
    seed_postings_if_empty,
)
from backend.llm_provider import get_embedding

app = FastAPI(
    title="PlacePilot API",
    description="Multi-agent career scouting and application tailoring platform for students.",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Startup Initialization
# ==========================================

@app.on_event("startup")
def on_startup():
    """Initializes SQLite schema and seeds postings and knowledge docs if empty."""
    init_db()
    seed_postings_if_empty(embed_fn=get_embedding)
    seed_knowledge_docs_if_empty(embed_fn=get_embedding)
    print("[PlacePilot] Database initialized and verified.")


# ==========================================
# Request / Response Schemas
# ==========================================

class OrchestrateRequest(BaseModel):
    goal: str = Field(..., description="Student search goal or query, e.g. 'find 5 web dev internships'")
    base_resume: str = Field(..., description="Base resume text to tailor for applications")
    top_k: Optional[int] = Field(5, description="Number of matching opportunities to retrieve")


class ChatRequest(BaseModel):
    question: str = Field(..., description="Student career or application question")


class ResumeUploadRequest(BaseModel):
    text: Optional[str] = Field(None, description="Pasted resume text")


# ==========================================
# Endpoints
# ==========================================

@app.get("/health")
def health_check():
    """Simple health probe."""
    return {"status": "ok", "service": "PlacePilot Backend"}


@app.post("/orchestrate")
def api_orchestrate(payload: OrchestrateRequest):
    """
    POST /orchestrate
    Takes a user's goal + base resume text, runs the Orchestrator pipeline,
    and returns shortlisted postings with match reasons and tailored drafts.
    """
    if not payload.goal.strip():
        raise HTTPException(status_code=400, detail="Search goal cannot be empty.")
    if not payload.base_resume.strip():
        raise HTTPException(status_code=400, detail="Base resume text cannot be empty.")

    try:
        result = orchestrate(
            goal=payload.goal,
            base_resume=payload.base_resume,
            top_k=payload.top_k or 5
        )
        return result
    except Exception as e:
        print(f"[API /orchestrate Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Orchestration pipeline failed: {str(e)}")


@app.post("/applications/{id}/approve")
def api_approve_application(id: str):
    """
    POST /applications/{id}/approve
    Marks a draft as applied, writes through the Tracker Agent.
    """
    try:
        updated = track_application(posting_id=id, status="applied")
        return {
            "success": True,
            "message": f"Application for posting '{id}' successfully marked as applied.",
            "application": updated
        }
    except Exception as e:
        print(f"[API /applications/{id}/approve Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record application: {str(e)}")


@app.get("/applications")
def api_get_applications():
    """
    GET /applications
    Returns current application statuses for the tracker screen.
    """
    try:
        apps = get_applications()
        return {"applications": apps, "count": len(apps)}
    except Exception as e:
        print(f"[API /applications Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve applications: {str(e)}")


@app.post("/resume/upload")
async def api_upload_resume(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """
    POST /resume/upload
    Accepts a PDF or pasted text, calls the Resume Parser Agent.
    """
    try:
        if file:
            content_bytes = await file.read()
            parsed = parse_resume(file_or_text=content_bytes)
            return {"success": True, "parsed_resume": parsed}
        elif text and text.strip():
            parsed = parse_resume(file_or_text=text.strip())
            return {"success": True, "parsed_resume": parsed}
        else:
            raise HTTPException(status_code=400, detail="Please provide either a PDF file or text content.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[API /resume/upload Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")


@app.post("/chat")
def api_chat(payload: ChatRequest):
    """
    POST /chat
    Takes a user question, calls the Chatbot Agent, returns its response.
    """
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        response = answer_question(user_question=payload.question)
        return response
    except Exception as e:
        print(f"[API /chat Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Chatbot failed to process question: {str(e)}")


@app.get("/history")
def api_get_history():
    """Returns agent audit history logs."""
    try:
        return {"history": get_history(limit=50)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


@app.get("/postings")
def api_get_postings():
    """Returns all available postings."""
    try:
        return {"postings": get_postings()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve postings: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
