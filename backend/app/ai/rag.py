from typing import List, Dict, Any
import logging
import json

from .llm_client import call_llm

logger = logging.getLogger(__name__)

RAG_SYSTEM_PROMPT = """You are a trusted advisor to a non-technical market access analyst. 
Your job is to answer questions about clinical coverage policies clearly, simply, and accessibly.

CRITICAL INSTRUCTIONS:
1. You MUST ONLY use the provided text chunks (evidence) to answer the question.
2. If the answer is not contained in the evidence, clearly state: "The provided policy evidence does not contain the answer." Do not guess.
3. You MUST provide strict citations referencing the exact source chunks used to formulate your answer.
4. Keep the business impact clear for the analyst. Omit excessive medical jargon unless necessary to define coverage.

You must output a JSON response containing 'answer' (your full response string) and 'citations' (a list of string references).
"""

def rag_query(question: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    RAG utility to answer user questions against retrieved chunks.
    Assumes chunks come in form: [{"text": "...", "citation": "..."}]
    """
    if not chunks:
        return {
            "answer": "No policy evidence was retrieved to answer this query.",
            "citations": [],
            "used_fallback": False
        }

    compiled_evidence = "EVIDENCE CHUNKS:\n"
    for i, c in enumerate(chunks):
        citation = c.get("citation", f"Chunk {i+1}")
        text = c.get("text", "")
        compiled_evidence += f"\n--- [{citation}] ---\n{text}\n"

    user_prompt = f"{compiled_evidence}\n\nQUESTION FROM ANALYST:\n{question}"

    try:
        response = call_llm(
            task_type="qa",
            system_prompt=RAG_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        content = response.get("content", "")
        content = content.strip()
        if content.startswith("```json"):
            content = content[len("```json"):]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        parsed = json.loads(content)
        
        return {
            "answer": parsed.get("answer", ""),
            "citations": parsed.get("citations", []),
            "used_fallback": response.get("provider") == "cerebras",
            "provider": response.get("provider")
        }
    except Exception as e:
        logger.error(f"RAG query generation failed: {str(e)}")
        raise RuntimeError("RAG query failed.") from e
