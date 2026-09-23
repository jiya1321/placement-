# PlacePilot

**A Permission-Limited Multi-Agent Career Scouting and Application Assistant for Students**

---

## 1. Project Title & Team Members

- **Project Title:** PlacePilot
- **Course:** CS Senior Capstone / Advanced Software Engineering
- **Team Members:**
  - Kunal Ahuja (Lead Architect, Agent Federation & Backend Pipeline)
  - Capstone Student Team (Multi-Agent RBAC, Retrieval Engine, Frontend Interface)

---

## 2. Problem Statement & Solution Overview

### Problem
Applying for summer internships involves several disconnected, high-friction tasks:
1. Sifting through hundreds of irrelevant job postings across scattered boards.
2. Manually tailoring resumes and writing custom cover letters for each individual role.
3. Inconsistently tracking application statuses across spreadsheets.
4. Answering nuanced career questions (etiquette, cold outreach, interview standards) without hallucinated or irrelevant advice.

Students usually execute these steps manually, leading to application fatigue or spamming generic resumes with low interview conversion.

### Solution
**PlacePilot** coordinates a team of six small, permission-limited AI agents that automate repetitive discovery and drafting while keeping the student in full control of every application actually sent. Every agent has a singular responsibility and a mathematically enforced Role-Based Access Control (RBAC) permission list.

---

## 3. Architecture & Data Flow

```
                                  +-------------------+
                                  |   Student User    |
                                  +---------+---------+
                                            | (Goal + Resume)
                                            v
                                  +-------------------+
                                  |   Orchestrator    |  (RBAC: [])
                                  |      Agent        |  Delegates only, touches 0 tables
                                  +---+-----------+---+
                                      |           |
            +-------------------------+           +--------------------------+
            | (Goal)                                                         | (Shortlist + Resume)
            v                                                                v
  +-------------------+                                            +-------------------+
  |  Research Agent   | (RBAC: ["postings_read"])                  |  Drafting Agent   | (RBAC: ["resumes_read", "postings_read"])
  |  - Cosine Search  |                                            |  - Tailored Summ. |
  |  - Match Reasons  |                                            |  - Varied Openers |
  +---------+---------+                                            +-------------------+
            |                                                                |
            |                                                                v
            |                                                      +-------------------+
            |                                                      |   Tracker Agent   | (RBAC: ["applications_write", "history_write"])
            |                                                      |  - Approve Draft  | Sole agent modifying applications table
            |                                                      +-------------------+
            | (A2A Request)                                                  |
            +<--------------------------+                                    v
                                        |                        +-----------------------+
                              +---------+---------+              |  SQLite: placepilot.db|
                              |  Chatbot Agent    |              |  - postings           |
                              |  (RBAC: ["kb"])   |              |  - resumes            |
                              |  - Domain RAG     |              |  - applications       |
                              +-------------------+              |  - history            |
                                                                 |  - knowledge_docs     |
                                                                 +-----------------------+
```

### The Six Agents & RBAC Matrix
RBAC is enforced via a simple Python dictionary in `backend/permissions.py`:

| Agent | Allowed Permissions | Role & Responsibility |
|---|---|---|
| **Orchestrator** | `[]` | Workflow entry point. Delegates to Research & Drafting agents; touches no tables directly. |
| **Resume Parser** | `["resumes"]` | Extracts text from PDF/text via MCP and parses structured skills, education, and summaries. |
| **Research** | `["postings_read"]` | Embeds student goal, computes cosine similarity against postings, generates varied 1-line match reasons. |
| **Drafting** | `["resumes_read", "postings_read"]` | Generates bespoke resume summaries and cover letters with varied opening hooks. Cannot write to applications. |
| **Tracker** | `["applications_write", "history_write"]` | Sole agent allowed to update application status and write audit logs into the history table. |
| **Domain Chatbot** | `["knowledge_base_read"]` | Answers career questions using knowledge base chunks. Refuses off-topic questions. Uses A2A for live job details. |

### Model Context Protocol (MCP) Tool Layer
In `backend/mcp_server.py`, three tools are exposed behind a local MCP interface:
1. `search_postings(query: str, top_k: int)`: Used by Research Agent for semantic vector search and keyword matching.
2. `extract_resume_text(file)`: Used by Resume Parser Agent to parse PDF documents via `pdfplumber`.
3. `log_history(agent_name: str, action_type: str, detail: str)`: Used by all agents to record an immutable audit trail.

### Agent-to-Agent (A2A) Pattern
When a student asks the Domain Chatbot for live details about an internship (e.g. *"When is the deadline for post-001?"*), the Chatbot is forbidden by RBAC from reading the `postings` table directly. Instead, it dispatches an A2A message:
```json
{
  "from": "chatbot",
  "to": "research",
  "request": "get_posting_details",
  "params": {"posting_id": "post-001"}
}
```
The dispatcher forwards this to `research.get_posting_details()`, returning the verified details back to the Chatbot to formulate the grounded response.

---

## 4. Tech Stack

- **Backend:** Python 3.10+, FastAPI, SQLite (`placepilot.db`), Uvicorn, Pydantic, PDFPlumber
- **AI Providers:**
  - Google Gemini (`gemini-1.5-flash` / `@google/genai`) for development & free tier
  - Azure OpenAI (`AzureOpenAI`) for final submission
- **Frontend:** React 19, Vite, Tailwind CSS with a warm academic editorial theme, Lucide Icons, Motion
- **Database:** SQLite with 5 tables (`postings`, `resumes`, `applications`, `history`, `knowledge_docs`)

---

## 5. Setup & Configuration

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your credentials according to your active provider:

#### Option A: Google Gemini (Development / Free Tier)
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Option B: Azure OpenAI (Final Submission)
```env
LLM_PROVIDER=azure
AZURE_OPENAI_API_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
```

### 2. Provider Embeddings Note & Regeneration
> **Important:** Embeddings from Gemini and Azure OpenAI are mathematically incompatible (different dimensionalities and latent spaces). Switching `LLM_PROVIDER` requires regenerating all stored embeddings.

Run the regeneration script:
```bash
python backend/regenerate_embeddings.py
```

### 3. Curated Sample Postings vs. Live API Note
The initial database seeds 42 mock internship postings from `backend/data/postings_seed.json`. This curated dataset stands in for a live job feed. In a production environment, a real job-board API (such as the free Adzuna or Remotive API) could be swapped into `search_postings()` in `mcp_server.py` without modifying any other agent or database table.

---

## 6. How to Run Locally

### Start Backend
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Launch FastAPI server on port 8000
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend Dev Server
```bash
# Install Node dependencies
npm install

# Launch Vite dev server on port 3000
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 7. Testing Notes & End-to-End Verification

1. **Dashboard Flow:** Enter a goal (e.g. *"Find 3 full-stack React and Python internships"*), review the default sample resume, and click **Research & Draft Applications**.
2. **Reviewing Artifacts:** Observe the varied one-line match reasons and tailored cover letters with distinct opening hooks.
3. **Approving Drafts:** Click **Approve Draft** on a recommendation card; the button toggles to "Applied" and persists into the database.
4. **Application Tracker:** Navigate to the **Applications Tracker** tab to view applied jobs with timestamps and status badges.
5. **Career Chat:** Navigate to the **Career Chat** tab:
   - Ask on-domain questions: *"What are good action verbs for my resume?"* or *"When should I apply for summer internships?"*
   - Ask job-specific questions: *"What is the stipend and deadline for post-001?"* (triggers the A2A dispatcher).
   - Ask off-domain questions: *"How do I bake sourdough bread?"* (triggers strict domain refusal).

---

## 8. Known Limitations & Future Scope

- **Curated Dataset:** Current search queries operate over seeded mock postings in SQLite rather than live scraping.
- **Single Student Context:** In this capstone scope, all operations run for a single local student without multi-tenant authentication.
- **Future Scope (Not Built):** Future iterations could integrate an interactive mock technical interview simulator with automated speech-to-text evaluation and personalized coding drills.

---

## 9. Acknowledgements & References

- **Google Gemini API**: Generative text completion and vector embeddings (`models/embedding-001`).
- **Azure OpenAI Service**: Chat completions and embeddings for submission evaluation.
- **PDFPlumber**: Text extraction from uploaded student resume PDFs.
- **FastAPI & Pydantic**: Clean, self-documenting REST APIs.
- **Tailwind CSS & Lucide**: Design system tokens and icon primitives.
