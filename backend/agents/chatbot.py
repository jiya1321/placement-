"""
PlacePilot - Domain Chatbot Agent.

RBAC: Allowed table access is ["knowledge_base_read"] only.
Answers student questions using semantic retrieval over curated career knowledge docs.
If a question requires live posting details (e.g. deadline for a role), it initiates an
Agent-to-Agent (A2A) request to the Research Agent rather than querying postings directly.
Strictly refuses off-domain queries outside the provided context.
"""

import json
import re
from typing import Any, Dict, List, Optional

from backend.db import get_knowledge_docs
from backend.llm_provider import get_completion, get_embedding
from backend.mcp_server import _cosine_similarity, mcp_server
from backend.permissions import check_permission

AGENT_NAME = "chatbot"
OFF_TOPIC_REFUSAL = "I can only help with questions about internship applications and career guidance within PlacePilot."


# ==========================================
# Agent-to-Agent (A2A) Dispatcher
# ==========================================

def dispatch_a2a_message(message: Dict[str, Any]) -> Any:
    """
    Lightweight Agent-to-Agent (A2A) message broker.
    Shared message format:
      {
        "from": "chatbot",
        "to": "research",
        "request": "get_posting_details",
        "params": {"posting_id": "post-001"}
      }
    """
    target = message.get("to")
    request_type = message.get("request")
    params = message.get("params", {})

    if target == "research":
        from backend.agents.research import get_posting_details
        if request_type == "get_posting_details":
            posting_id = params.get("posting_id", "")
            return get_posting_details(posting_id)

    raise ValueError(f"Unsupported A2A message route: {message}")


# ==========================================
# Chatbot Main Logic
# ==========================================

def _find_mentioned_posting_id(question: str) -> Optional[str]:
    """
    Detects if the user's question references a specific posting ID (e.g. 'post-001')
    or identifiable role name from the postings.
    """
    # Check for direct ID mention like post-001
    match = re.search(r"\bpost-\d{3}\b", question, re.IGNORECASE)
    if match:
        return match.group(0).lower()

    # Keyword check against common mock postings
    q_lower = question.lower()
    if "frontend engineering intern" in q_lower or "voxel dynamics" in q_lower:
        return "post-001"
    if "full-stack software intern" in q_lower or "horizon cloud" in q_lower:
        return "post-002"
    if "backend systems intern" in q_lower or "aether data" in q_lower:
        return "post-003"
    if "machine learning research intern" in q_lower or "deepcortex" in q_lower:
        return "post-004"
    if "product design" in q_lower or "lumina" in q_lower:
        return "post-006"

    return None


def answer_question(user_question: str) -> Dict[str, Any]:
    """
    Answers a career or application query using RAG over the knowledge base,
    or via an A2A call to the Research Agent if querying a specific internship posting.
    Enforces strict RBAC and domain containment.
    """
    # 1. Enforce RBAC permission
    check_permission(AGENT_NAME, "knowledge_base_read")

    # 2. Check if the question requires live posting data (Agent-to-Agent pattern)
    mentioned_posting_id = _find_mentioned_posting_id(user_question)
    a2a_context = ""
    a2a_log = None

    if mentioned_posting_id:
        a2a_msg = {
            "from": AGENT_NAME,
            "to": "research",
            "request": "get_posting_details",
            "params": {"posting_id": mentioned_posting_id}
        }
        posting_data = dispatch_a2a_message(a2a_msg)
        if posting_data:
            a2a_log = a2a_msg
            a2a_context = (
                f"Live Posting Details retrieved via A2A request to Research Agent:\n"
                f"- Role: {posting_data['title']}\n"
                f"- Company: {posting_data['company']}\n"
                f"- Location: {posting_data['location']}\n"
                f"- Stipend: {posting_data['stipend']}\n"
                f"- Application Deadline: {posting_data['deadline']}\n"
                f"- Required Skills: {posting_data['skills']}\n"
                f"- Description: {posting_data['description']}\n"
            )

    # 3. Retrieve top relevant knowledge docs
    docs = get_knowledge_docs()
    question_vec = get_embedding(user_question)

    scored_docs = []
    for doc in docs:
        doc_vec = None
        if doc.get("embedding"):
            try:
                doc_vec = json.loads(doc["embedding"])
            except Exception:
                doc_vec = None
        score = _cosine_similarity(question_vec, doc_vec) if doc_vec else 0.0
        scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    top_docs = [item[1] for item in scored_docs[:3]]

    # Assemble context
    kb_context = "\n\n---\n\n".join([f"[{d['filename']}]\n{d['content']}" for d in top_docs])
    full_context = f"{a2a_context}\n\n{kb_context}".strip()

    # 4. Strict domain prompt
    system_prompt = (
        "You are PlacePilot Career Guide. "
        "Only answer using the provided context. If the context does not contain relevant information, "
        "respond exactly with: 'I can only help with questions about internship applications and career guidance within PlacePilot.' "
        "Never use outside knowledge."
    )

    prompt = f"""
Context:
{full_context}

User Question:
{user_question}
"""

    raw_answer = get_completion(prompt=prompt, system_prompt=system_prompt)

    # Guardrail check
    if not raw_answer or len(raw_answer.strip()) == 0:
        answer = OFF_TOPIC_REFUSAL
    else:
        answer = raw_answer.strip()

    # 5. Log chatbot interaction via MCP
    mcp_server.call_tool("log_history", {
        "agent_name": AGENT_NAME,
        "action_type": "asked_question",
        "detail": f"Answered question: '{user_question[:60]}...'"
    })

    return {
        "question": user_question,
        "answer": answer,
        "a2a_dispatched": a2a_log is not None,
        "a2a_message": a2a_log
    }
