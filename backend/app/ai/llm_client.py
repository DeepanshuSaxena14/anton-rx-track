import os
import json
import logging
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Basic Provider URLs
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"

def call_llm(
    task_type: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.0,
    response_format: Optional[Dict[str, Any]] = None
) -> dict:
    """
    Centralized LLM router.
    task_type == "extraction" routes to Gemini.
    task_type == "qa" or "diff" or "appeal" routes to Groq, falling back to Cerebras.
    """
    if task_type == "extraction":
        return _call_gemini(system_prompt, user_prompt, temperature, response_format)
    else:
        # Default for QA, Diff, Summarization, etc.
        try:
            return _call_groq(system_prompt, user_prompt, temperature, response_format)
        except Exception as e:
            logger.warning(f"Groq logic failed ({str(e)}), falling back to Cerebras.")
            return _call_cerebras(system_prompt, user_prompt, temperature, response_format)

def _call_gemini(system_prompt: str, user_prompt: str, temperature: float, response_format: Optional[Dict[str, Any]]) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")
        
    url = f"{GEMINI_API_URL}?key={api_key}"
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [{
            "role": "user",
            "parts": [{"text": user_prompt}]
        }],
        "generationConfig": {
            "temperature": temperature
        }
    }
    
    if response_format and response_format.get("type") == "json_object":
        payload["generationConfig"]["responseMimeType"] = "application/json"
    
    response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=60)
    response.raise_for_status()
    data = response.json()
    
    try:
        text_content = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"content": text_content, "provider": "gemini", "status": "success"}
    except (KeyError, IndexError) as e:
         logger.error(f"Gemini response format error: {data}")
         raise RuntimeError("Invalid response structure from Gemini") from e

def _call_openai_compatible(url: str, api_key: str, model: str, system_prompt: str, user_prompt: str, temperature: float, response_format: Optional[Dict[str, Any]], provider_name: str) -> dict:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature
    }
    
    if response_format:
        payload["response_format"] = response_format
        
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    data = response.json()
    
    try:
        text_content = data["choices"][0]["message"]["content"]
        return {"content": text_content, "provider": provider_name, "status": "success"}
    except (KeyError, IndexError) as e:
         logger.error(f"{provider_name} response format error: {data}")
         raise RuntimeError(f"Invalid response structure from {provider_name}") from e

def _call_groq(system_prompt: str, user_prompt: str, temperature: float, response_format: Optional[Dict[str, Any]]) -> dict:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set.")
    # Assuming llama3-8b-8192 or llama3-70b-8192
    return _call_openai_compatible(GROQ_API_URL, api_key, "llama3-70b-8192", system_prompt, user_prompt, temperature, response_format, "groq")

def _call_cerebras(system_prompt: str, user_prompt: str, temperature: float, response_format: Optional[Dict[str, Any]]) -> dict:
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        raise ValueError("CEREBRAS_API_KEY is not set.")
    return _call_openai_compatible(CEREBRAS_API_URL, api_key, "llama3.1-70b", system_prompt, user_prompt, temperature, response_format, "cerebras")

# --- Minimal Smoke Test / Example Usage ---
# Run this script directly to verify missing credentials raise clear errors:
# python -m app.ai.llm_client
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Testing LLM Client Graceful Failure (Keys should NOT be hardcoded).")
    
    print("\n--- Testing Extraction Route (Gemini) ---")
    try:
        call_llm("extraction", "You are a test bot.", "Hello.")
        print("[SUCCESS] Extraction call worked (keys were present in environment).")
    except ValueError as e:
        print(f"[EXPECTED FAILURE] Missing Key for Extraction: {e}")
    except Exception as e:
        print(f"[UNEXPECTED FAILURE] Extraction: {e}")

    print("\n--- Testing QA Route (Groq -> Cerebras Fallback) ---")
    try:
        call_llm("qa", "You are a test bot.", "Hello.")
        print("[SUCCESS] QA call worked (keys were present in environment).")
    except ValueError as e:
        print(f"[EXPECTED FAILURE] Missing Key for QA/Cerebras: {e}")
    except Exception as e:
        print(f"[UNEXPECTED FAILURE] QA: {e}")
