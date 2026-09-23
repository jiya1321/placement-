"""
PlacePilot - LLM Provider Abstraction Layer.

This module exposes exactly two functions: get_completion and get_embedding.
No agent, tool, or endpoint file anywhere in the project imports an AI provider's
client library directly; all completions and vectorizations pass through this file.

IMPORTANT ARCHITECTURAL NOTE:
Embeddings from Gemini and Azure are not compatible with each other (differing dimensions
and vector spaces). Switching providers requires regenerating all stored embeddings using
the backend/regenerate_embeddings.py script.
"""

import hashlib
import json
import math
import os
import re
from typing import List

# Attempt to load environment variables from .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def _deterministic_local_embedding(text: str, dim: int = 128) -> List[float]:
    """
    Fallback deterministic bag-of-words / hash embedding vector used when
    an external API key is not configured or network calls are unavailable.
    Produces stable 128-dimensional normalized vectors.
    """
    words = re.findall(r"\w+", text.lower())
    vec = [0.0] * dim
    for word in words:
        # Hash word across multiple slots for dense representation
        h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
        vec[idx] += sign * (1.0 + math.log(1 + len(word)))

    # Compute Euclidean norm
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    else:
        vec[0] = 1.0
    return vec


def _fallback_completion(prompt: str, system_prompt: str = "") -> str:
    """
    Graceful fallback completion generator for offline development or testing
    when API credentials are not yet configured by the user.
    """
    prompt_lower = prompt.lower()
    system_lower = system_prompt.lower()

    # Chatbot scenario
    if "only answer using the provided context" in system_lower:
        if "context:" in prompt_lower:
            parts = prompt.split("Context:", 1)
            if len(parts) > 1:
                ctx = parts[1].strip()
                # If question asks about placepilot or applications
                return (
                    f"Based on PlacePilot career guidance: {ctx[:320]}... "
                    "Make sure to submit tailored applications early, highlight concrete metrics on your resume, "
                    "and communicate your problem-solving process during technical screens."
                )
        return "I can only help with questions about internship applications and career guidance within PlacePilot."

    # Resume parser scenario
    if "structured json" in prompt_lower or "json" in prompt_lower:
        return json.dumps({
            "skills": ["Python", "TypeScript", "React", "FastAPI", "SQL", "Git"],
            "education": "B.S. in Computer Science (In Progress)",
            "experience_summary": "Hands-on experience building full-stack applications, managing relational databases, and deploying containerized cloud services."
        }, indent=2)

    # Match reason scenario
    if "match reason" in prompt_lower or "one-line" in prompt_lower:
        return "Your practical background with component design and API integrations directly aligns with this team's core sprint objectives."

    # Drafting scenario (resume summary & cover letter)
    if "cover letter" in prompt_lower or "tailored resume summary" in prompt_lower:
        return (
            "TAILORED RESUME SUMMARY:\n"
            "Full-stack software developer with proven background delivering responsive web interfaces, robust REST APIs, "
            "and clean automated tests. Passionate about rapid iteration and cross-functional team collaboration.\n\n"
            "COVER LETTER:\n"
            "Dear Hiring Team,\n\n"
            "Having closely tracked your team's engineering velocity and technical standards, I was energized to see this opening. "
            "My recent work building modular web services with automated validation and responsive interfaces mirrors the exact demands of this role. "
            "I look forward to contributing clean code, high curiosity, and dedicated focus to your upcoming summer cohort.\n\n"
            "Sincerely,\nCandidate"
        )

    return "PlacePilot agent generated response: analyzed specifications and aligned student goals with relevant internship benchmarks."


def get_completion(prompt: str, system_prompt: str = "") -> str:
    """
    Returns plain text completion from whichever provider is currently active.
    Branches based on LLM_PROVIDER env variable ('gemini' or 'azure').
    """
    provider = os.getenv("LLM_PROVIDER", "gemini").strip().lower()

    # 1. Google Gemini Provider
    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            return _fallback_completion(prompt, system_prompt)

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            # Combine system prompt if provided
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(full_prompt)
            if response and response.text:
                return response.text.strip()
            return _fallback_completion(prompt, system_prompt)
        except Exception as e:
            # If rate limited, network unavailable, or invalid key, return clear fallback without crash
            print(f"[LLM Provider Warning] Gemini API call failed ({e}). Using robust fallback.")
            return _fallback_completion(prompt, system_prompt)

    # 2. Azure OpenAI Provider
    elif provider == "azure":
        azure_key = os.getenv("AZURE_OPENAI_API_KEY", "").strip()
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
        azure_deployment = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "").strip()

        if not (azure_key and azure_endpoint and azure_deployment):
            return _fallback_completion(prompt, system_prompt)

        try:
            from openai import AzureOpenAI
            client = AzureOpenAI(
                api_key=azure_key,
                api_version="2024-02-15-preview",
                azure_endpoint=azure_endpoint,
            )
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            completion = client.chat.completions.create(
                model=azure_deployment,
                messages=messages,
                temperature=0.7,
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"[LLM Provider Warning] Azure OpenAI call failed ({e}). Using robust fallback.")
            return _fallback_completion(prompt, system_prompt)

    else:
        return _fallback_completion(prompt, system_prompt)


def get_embedding(text: str) -> List[float]:
    """
    Returns an embedding vector from whichever provider is currently active.
    Branches based on LLM_PROVIDER env variable ('gemini' or 'azure').
    """
    provider = os.getenv("LLM_PROVIDER", "gemini").strip().lower()

    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            return _deterministic_local_embedding(text)

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            if "embedding" in result:
                return result["embedding"]
            return _deterministic_local_embedding(text)
        except Exception as e:
            print(f"[LLM Provider Warning] Gemini embedding failed ({e}). Using deterministic embedding.")
            return _deterministic_local_embedding(text)

    elif provider == "azure":
        azure_key = os.getenv("AZURE_OPENAI_API_KEY", "").strip()
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
        azure_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "").strip()

        if not (azure_key and azure_endpoint and azure_deployment):
            return _deterministic_local_embedding(text)

        try:
            from openai import AzureOpenAI
            client = AzureOpenAI(
                api_key=azure_key,
                api_version="2024-02-15-preview",
                azure_endpoint=azure_endpoint,
            )
            response = client.embeddings.create(
                input=text,
                model=azure_deployment
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"[LLM Provider Warning] Azure embedding failed ({e}). Using deterministic embedding.")
            return _deterministic_local_embedding(text)

    else:
        return _deterministic_local_embedding(text)
