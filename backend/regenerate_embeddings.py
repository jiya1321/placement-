"""
PlacePilot - Embeddings Regeneration Script.

Re-embeds every posting in the 'postings' table and every document in the 'knowledge_docs'
table using whichever provider is currently active (configured via LLM_PROVIDER in .env).

Run this script whenever switching between Gemini and Azure OpenAI providers:
    python backend/regenerate_embeddings.py
"""

import sys
import os

# Add parent directory to path so imports work cleanly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import (
    init_db,
    get_postings,
    update_posting_embedding,
    get_knowledge_docs,
    update_knowledge_doc_embedding,
)
from backend.llm_provider import get_embedding


def regenerate_all_embeddings() -> None:
    print("=" * 60)
    print("PlacePilot: Starting Full Embeddings Regeneration")
    provider = os.getenv("LLM_PROVIDER", "gemini")
    print(f"Active Provider: {provider}")
    print("=" * 60)

    init_db()

    # 1. Regenerate postings embeddings
    postings = get_postings()
    print(f"\n[1/2] Processing {len(postings)} internship postings...")
    for idx, p in enumerate(postings, start=1):
        content = f"{p['title']} at {p['company']}. {p['description']} Required skills: {p['skills']}"
        try:
            vec = get_embedding(content)
            update_posting_embedding(p["id"], vec)
            print(f"  [{idx}/{len(postings)}] Embedded posting '{p['title']}' ({p['id']}) - dim {len(vec)}")
        except Exception as e:
            print(f"  [ERROR] Failed to embed posting {p['id']}: {e}")

    # 2. Regenerate knowledge base documents embeddings
    knowledge_docs = get_knowledge_docs()
    print(f"\n[2/2] Processing {len(knowledge_docs)} knowledge base documents...")
    for idx, doc in enumerate(knowledge_docs, start=1):
        try:
            vec = get_embedding(doc["content"])
            update_knowledge_doc_embedding(doc["id"], vec)
            print(f"  [{idx}/{len(knowledge_docs)}] Embedded doc '{doc['filename']}' ({doc['id']}) - dim {len(vec)}")
        except Exception as e:
            print(f"  [ERROR] Failed to embed doc {doc['id']}: {e}")

    print("\n" + "=" * 60)
    print("Embeddings regeneration complete! All tables updated successfully.")
    print("=" * 60)


if __name__ == "__main__":
    regenerate_all_embeddings()
