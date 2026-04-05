import logging
from .llm_client import call_llm

logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = """You are a clinical policy analyst. Given a raw payer policy document excerpt, 
produce a concise, plain-English summary (3-5 sentences maximum) that covers:
1. What drug/biologic is covered
2. The key prior authorization requirements
3. Any step therapy or fail-first requirements
4. Notable restrictions or site-of-care requirements

Rules:
- Be direct and factual. No filler phrases.
- Do NOT output JSON or bullet points. Write flowing prose.
- Keep it under 120 words.
"""


def summarize_document(full_text: str) -> str:
    """
    Generates a short plain-English summary of a policy document.
    Uses a truncated excerpt to stay within token limits.
    """
    # Use the first 4000 chars — enough for the key clinical context
    excerpt = full_text[:4000]

    user_prompt = f"""Summarize the following payer policy document:

---
{excerpt}
---

Provide a concise 3-5 sentence summary covering coverage, PA requirements, and key restrictions."""

    try:
        response = call_llm(
            task_type="summarize",
            system_prompt=SUMMARY_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.0,
        )
        return response.get("content", "Summary unavailable.")
    except Exception as e:
        logger.warning(f"Document summarization failed: {e}")
        return "Summary could not be generated."
