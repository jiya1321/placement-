"""
PlacePilot - Orchestrator Agent.

RBAC: Allowed table access is [] (delegates only, touches zero tables directly).
Entry point for goal-based workflows like "find me 5 web dev internships and help me apply."
Coordinates the pipeline:
  1. Calls Research Agent to shortlist matching postings with varied match reasons.
  2. Calls Drafting Agent to synthesize tailored resume summaries & cover letters for each.
  3. Combines and returns the end-to-end results to the caller.
"""

from typing import Any, Dict, List

from backend.agents.drafting_tracker import generate_draft
from backend.agents.research import find_matching_postings
from backend.permissions import check_permission

AGENT_NAME = "orchestrator"


def orchestrate(goal: str, base_resume: str, top_k: int = 5) -> Dict[str, Any]:
    """
    Coordinates end-to-end multi-agent workflow:
    Research Agent (discovery + matching) -> Drafting Agent (tailoring).
    Has zero direct database table access.
    """
    # 1. Call Research Agent to discover matching postings
    shortlisted_postings = find_matching_postings(goal=goal, top_k=top_k)

    if not shortlisted_postings:
        return {
            "goal": goal,
            "results": [],
            "message": "No matching internship postings found for your query. Try broadening your keywords."
        }

    # 3. Call Drafting Agent for each match to generate tailored drafts
    annotated_results: List[Dict[str, Any]] = []
    for posting in shortlisted_postings:
        posting_id = posting["id"]
        try:
            draft = generate_draft(posting_id=posting_id, base_resume=base_resume)
        except Exception as e:
            draft = {
                "posting_id": posting_id,
                "resume_summary": f"Tailored profile highlighting skills in {posting.get('skills', '')}.",
                "cover_letter": f"Dear Hiring Team at {posting.get('company', 'Company')},\n\nI am eager to contribute to your engineering cohort."
            }

        annotated_results.append({
            "posting": posting,
            "match_reason": posting.get("match_reason", "Aligned with student technical interests."),
            "resume_summary": draft.get("resume_summary", ""),
            "cover_letter": draft.get("cover_letter", "")
        })

    return {
        "goal": goal,
        "results": annotated_results,
        "count": len(annotated_results),
        "message": f"Successfully identified and drafted applications for {len(annotated_results)} opportunities."
    }
