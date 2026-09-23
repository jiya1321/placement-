"""
PlacePilot - Drafting Agent & Tracker Agent.

This file hosts both the Drafting Agent and Tracker Agent logic with distinct RBAC bounds:
  - Drafting Agent: Permissions ["resumes_read", "postings_read"].
    Generates tailored resume summaries and cover letters with varied opening hooks.
    Cannot write to applications or history tables.
  - Tracker Agent: Permissions ["applications_write", "history_write"].
    The sole agent permitted to modify application statuses and write audit logs.
"""

from typing import Any, Dict, Optional

from backend.db import get_posting_by_id, log_history_entry, save_or_update_application
from backend.llm_provider import get_completion
from backend.permissions import check_permission

DRAFTING_AGENT_NAME = "drafting"
TRACKER_AGENT_NAME = "tracker"


# ==========================================
# 3.4 Drafting Agent
# ==========================================

def generate_draft(posting_id: str, base_resume: str) -> Dict[str, str]:
    """
    Generates a tailored resume summary and a tailored cover letter for a given posting.
    Instructs the LLM to vary the cover letter opening line across different applications.
    Enforces RBAC: reads resumes and postings only; cannot write to applications or history.
    """
    # 1. Enforce RBAC permissions
    check_permission(DRAFTING_AGENT_NAME, "postings_read")
    check_permission(DRAFTING_AGENT_NAME, "resumes_read")

    # 2. Fetch posting details
    posting = get_posting_by_id(posting_id)
    if not posting:
        raise ValueError(f"Posting with ID '{posting_id}' does not exist.")

    # 3. Prompt LLM for tailored draft
    prompt = f"""
Candidate Resume Profile:
\"\"\"{base_resume[:2000]}\"\"\"

Internship Posting:
- Role: {posting['title']}
- Company: {posting['company']}
- Location: {posting['location']}
- Key Competencies: {posting['skills']}
- Description: {posting['description']}

Generate TWO tailored artifacts:
1. TAILORED RESUME SUMMARY: A sharp, 2-3 sentence technical overview customized specifically for {posting['company']}.
2. COVER LETTER: A concise, compelling 3-paragraph letter (under 250 words).

CRITICAL INSTRUCTION FOR COVER LETTER:
Vary the opening hook! DO NOT start with "I am writing to express my enthusiastic interest in...".
Instead, choose ONE of these dynamic approaches:
- Lead directly with a tangible engineering achievement or benchmark
- Lead with an informed observation about {posting['company']}'s recent tech or mission
- Lead with a relevant personal open-source project or challenge you solved

Format the response strictly as:
[RESUME_SUMMARY]
<summary here>
[COVER_LETTER]
<cover letter here>
"""
    system_prompt = "You are an elite career strategist crafting bespoke, human-sounding internship application materials."

    llm_output = get_completion(prompt=prompt, system_prompt=system_prompt)

    # 4. Parse sections cleanly
    resume_summary = ""
    cover_letter = ""

    if "[RESUME_SUMMARY]" in llm_output and "[COVER_LETTER]" in llm_output:
        parts = llm_output.split("[COVER_LETTER]")
        resume_part = parts[0].replace("[RESUME_SUMMARY]", "").strip()
        cover_letter_part = parts[1].strip() if len(parts) > 1 else ""
        resume_summary = resume_part
        cover_letter = cover_letter_part
    else:
        # Fallback split
        paragraphs = [p.strip() for p in llm_output.split("\n\n") if p.strip()]
        if len(paragraphs) >= 2:
            resume_summary = paragraphs[0]
            cover_letter = "\n\n".join(paragraphs[1:])
        else:
            resume_summary = (
                f"Driven computer science candidate eager to engineer production-ready solutions at {posting['company']}, "
                f"leveraging practical experience with {posting['skills']}."
            )
            cover_letter = llm_output or "Dear Hiring Team,\n\nI am eager to contribute to your upcoming engineering cohort."

    return {
        "posting_id": posting_id,
        "resume_summary": resume_summary,
        "cover_letter": cover_letter
    }


# ==========================================
# 3.5 Tracker Agent
# ==========================================

def track_application(posting_id: str, status: str = "applied") -> Dict[str, Any]:
    """
    The only agent function permitted to write to the applications table.
    Updates existing status or inserts a new application entry without duplicates.
    """
    # 1. Enforce RBAC permission
    check_permission(TRACKER_AGENT_NAME, "applications_write")

    # 2. Persist application status
    result = save_or_update_application(posting_id=posting_id, status=status)

    # 3. Log the status mutation
    log_history(
        agent_name=TRACKER_AGENT_NAME,
        action_type="approved" if status == "applied" else "status_updated",
        detail=f"Application for posting {posting_id} marked as '{status}'"
    )

    return result


def log_history(agent_name: str, action_type: str, detail: str) -> int:
    """
    Writes an audit entry to the history table.
    Enforces that only tracker permission can write to history.
    """
    check_permission(TRACKER_AGENT_NAME, "history_write")
    return log_history_entry(agent_name=agent_name, action_type=action_type, detail=detail)
