# How PlacePilot Works

PlacePilot is an AI-powered multi-agent internship assistant engineered specifically for students.
Instead of an opaque monolithic AI, PlacePilot coordinates a federation of six small, permission-restricted agents:

1. **Orchestrator Agent**: Receives student goals (e.g., "Find 5 full-stack internships"), delegates tasks to specialized agents, and merges findings. Has zero direct database access.
2. **Resume Parser Agent**: Extracts skills, education, and experience from uploaded documents and saves structured profiles into the `resumes` table.
3. **Research Agent**: Embeds search goals, computes cosine similarity against vetted internship postings, and generates tailored match reasons. Can only read the `postings` table.
4. **Drafting Agent**: Synthesizes tailored resume summaries and bespoke cover letters with varied opening hooks. Can read `resumes` and `postings` tables.
5. **Tracker Agent**: The sole agent permitted to modify application statuses and write audit logs into the `history` and `applications` tables.
6. **Domain Chatbot Agent**: Answers career, resume, and interview inquiries grounded strictly in curated knowledge documents, refusing off-domain questions.

All database mutations strictly enforce Role-Based Access Control (RBAC) defined in `permissions.py`.
