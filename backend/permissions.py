"""
PlacePilot - Role-Based Access Control (RBAC) Permissions Matrix.
Each agent has a fixed list of resources and actions it is permitted to perform.
Every agent function verifies this permission dictionary before accessing any database table.
"""

AGENT_PERMISSIONS = {
    "orchestrator": [],  # delegates only, touches no tables directly
    "resume_parser": ["resumes"],
    "research": ["postings_read"],
    "drafting": ["resumes_read", "postings_read"],
    "tracker": ["applications_write", "history_write"],
    "chatbot": ["knowledge_base_read"],
}


class AgentPermissionError(PermissionError):
    """Raised when an agent attempts an unauthorized database or resource operation."""
    pass


def check_permission(agent_name: str, required_permission: str) -> None:
    """
    Validates that the specified agent has permission to perform the requested action.
    Raises AgentPermissionError with a clear explanation if unauthorized.
    """
    allowed_permissions = AGENT_PERMISSIONS.get(agent_name, [])
    if required_permission not in allowed_permissions:
        raise AgentPermissionError(
            f"RBAC Violation: Agent '{agent_name}' attempted unauthorized action '{required_permission}'. "
            f"Allowed permissions for '{agent_name}': {allowed_permissions}"
        )
