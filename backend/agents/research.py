"""
PlacePilot - Research Agent.

RBAC: Allowed table access is ["postings_read"] only.
Functions:
  1. find_matching_postings(goal: str) -> List[Dict]
  2. get_posting_details(posting_id: str) -> Dict
"""

from typing import Any, Dict, List, Optional

from backend.db import get_posting_by_id
from backend.llm_provider import get_completion
from backend.mcp_server import mcp_server
from backend.permissions import check_permission

AGENT_NAME = "research"


def find_matching_postings(goal: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Finds top matching internship postings for a student's goal.
    Uses MCP search_postings, then generates a bespoke one-line match reason
    for each match with varied sentence structure and highlight of key overlap.
    """
    # 1. Enforce RBAC permission
    check_permission(AGENT_NAME, "postings_read")

    # 2. Query matching postings via MCP tool layer
    matched_postings = mcp_server.call_tool("search_postings", {
        "query": goal,
        "top_k": top_k
    })

    if not matched_postings:
        return []

    results = []
    for idx, p in enumerate(matched_postings):
        # 3. Prompt get_completion() to generate a varied, non-templated match reason
        prompt = f"""
Student Goal: "{goal}"
Job Opening:
- Title: {p['title']} at {p['company']}
- Required Skills: {p['skills']}
- Description: {p['description']}

Write exactly ONE concise, compelling sentence explaining why this specific posting is a prime match for the student.
CRITICAL INSTRUCTIONS:
- Vary sentence structure across postings.
- Highlight the single most relevant technical or domain overlap and briefly state WHY it matters.
- DO NOT use generic phrases like "your resume contains..." or "this job requires...".
- Keep it under 28 words.
"""
        system_prompt = "You are an insightful technical internship scout highlighting genuine project synergies."

        try:
            match_reason = get_completion(prompt=prompt, system_prompt=system_prompt).strip()
            # Clean up quotes if model added them
            match_reason = match_reason.strip('"\'')
        except Exception:
            match_reason = f"Strong alignment with {p['company']}'s emphasis on {p['skills'].split(',')[0]}."

        p_copy = dict(p)
        p_copy["match_reason"] = match_reason
        results.append(p_copy)

    # 4. Log search action via MCP
    mcp_server.call_tool("log_history", {
        "agent_name": AGENT_NAME,
        "action_type": "searched",
        "detail": f"Searched opportunities for goal '{goal[:50]}' (found {len(results)} matches)"
    })

    return results


def get_posting_details(posting_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves detailed info for a single posting.
    Called directly or via Agent-to-Agent (A2A) dispatcher by the Chatbot Agent.
    """
    check_permission(AGENT_NAME, "postings_read")
    return get_posting_by_id(posting_id)
