"""
PlacePilot - Model Context Protocol (MCP) Tool Server.

Exposes exactly three tools behind a lightweight local MCP server interface:
  1. search_postings(query: str) -> List[Dict]
  2. extract_resume_text(file_data) -> str
  3. log_history(agent_name: str, action_type: str, detail: str) -> int

Agents invoke tools strictly through `mcp_server.call_tool(tool_name, arguments)`
rather than importing underlying storage or PDF extraction libraries directly.
"""

import io
import json
import os
import re
from typing import Any, Dict, List, Union

from backend.db import get_postings, log_history_entry


def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = sum(a * a for a in vec1) ** 0.5
    mag2 = sum(b * b for b in vec2) ** 0.5
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


class MCPServer:
    """Lightweight in-process Model Context Protocol tool server."""

    def __init__(self):
        self.tool_definitions = {
            "search_postings": {
                "name": "search_postings",
                "description": "Searches internship postings using semantic and keyword matching.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Student internship goal or query"},
                        "top_k": {"type": "integer", "description": "Maximum postings to return", "default": 5}
                    },
                    "required": ["query"]
                }
            },
            "extract_resume_text": {
                "name": "extract_resume_text",
                "description": "Extracts plain text from an uploaded resume file (PDF or text).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "file": {"type": "string", "description": "Raw text or file path/content"}
                    },
                    "required": ["file"]
                }
            },
            "log_history": {
                "name": "log_history",
                "description": "Appends an immutable event log to the history audit trail.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "agent_name": {"type": "string"},
                        "action_type": {"type": "string"},
                        "detail": {"type": "string"}
                    },
                    "required": ["agent_name", "action_type", "detail"]
                }
            }
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        """Returns the registered MCP tool definitions."""
        return list(self.tool_definitions.values())

    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Dispatches an MCP tool call to the registered handler."""
        if tool_name not in self.tool_definitions:
            raise ValueError(f"MCP Tool '{tool_name}' not registered. Allowed tools: {list(self.tool_definitions.keys())}")

        if tool_name == "search_postings":
            return self._tool_search_postings(
                query=arguments.get("query", ""),
                top_k=arguments.get("top_k", 5)
            )
        elif tool_name == "extract_resume_text":
            return self._tool_extract_resume_text(
                file_input=arguments.get("file", "")
            )
        elif tool_name == "log_history":
            return self._tool_log_history(
                agent_name=arguments.get("agent_name", "system"),
                action_type=arguments.get("action_type", "info"),
                detail=arguments.get("detail", "")
            )

    # --- Tool Handlers ---

    def _tool_search_postings(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches postings via query embedding and keyword overlap.
        Returns top matches sorted by relevance score.
        """
        from backend.llm_provider import get_embedding

        all_postings = get_postings()
        if not all_postings:
            return []

        query_embedding = get_embedding(query)
        query_words = set(re.findall(r"\w+", query.lower()))

        scored_postings = []
        for p in all_postings:
            posting_vec = None
            if p.get("embedding"):
                try:
                    posting_vec = json.loads(p["embedding"])
                except Exception:
                    posting_vec = None

            cos_score = _cosine_similarity(query_embedding, posting_vec) if posting_vec else 0.0

            # Compute keyword overlap bonus
            full_text = f"{p['title']} {p['skills']} {p['description']} {p['company']}".lower()
            overlap_count = sum(1 for w in query_words if len(w) > 2 and w in full_text)
            kw_score = min(overlap_count * 0.15, 0.45)

            total_score = cos_score * 0.7 + kw_score * 0.3
            scored_postings.append((total_score, p))

        # Sort descending by relevance score
        scored_postings.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_postings[:top_k]]

    def _tool_extract_resume_text(self, file_input: Union[str, bytes]) -> str:
        """
        Extracts plain text from raw string or PDF bytes / file path using pdfplumber.
        """
        # If already plain text or short snippet
        if isinstance(file_input, str):
            # Check if file_input is a path on disk
            if os.path.isfile(file_input) and file_input.lower().endswith(".pdf"):
                try:
                    import pdfplumber
                    with pdfplumber.open(file_input) as pdf:
                        extracted = [page.extract_text() or "" for page in pdf.pages]
                        return "\n".join(extracted).strip()
                except Exception as e:
                    print(f"[MCP extract_resume_text] pdfplumber error on file path: {e}")
            return file_input.strip()

        # If bytes passed (e.g. uploaded file buffer)
        if isinstance(file_input, (bytes, bytearray)):
            try:
                import pdfplumber
                with pdfplumber.open(io.BytesIO(file_input)) as pdf:
                    extracted = [page.extract_text() or "" for page in pdf.pages]
                    return "\n".join(extracted).strip()
            except Exception as e:
                print(f"[MCP extract_resume_text] pdfplumber error on bytes: {e}")
                try:
                    # Fallback decoding as utf-8 text
                    return file_input.decode("utf-8", errors="ignore").strip()
                except Exception:
                    return "Uploaded resume content"

        return str(file_input).strip()

    def _tool_log_history(self, agent_name: str, action_type: str, detail: str) -> int:
        """Logs an event to the history table."""
        return log_history_entry(agent_name, action_type, detail)


# Global singleton MCP server instance
mcp_server = MCPServer()
