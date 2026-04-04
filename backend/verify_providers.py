import os
import sys
import json
import logging
from dotenv import load_dotenv

logging.basicConfig(level=logging.ERROR)

try:
    load_dotenv()
except:
    pass

import app.ai.llm_client as llm
from app.ai.extractor import extract_policy
from app.ai.rag import rag_query
from app.ai.appeal import generate_appeal_letter

# Disable fallback logic temporarily
def patch_call_llm(task_type, sys_p, usr_p, temp=0.0, fmt=None):
    if task_type == 'extraction':
        return llm._call_gemini(sys_p, usr_p, temp, fmt)
    elif task_type == 'groq':
        return llm._call_groq(sys_p, usr_p, temp, fmt)
    elif task_type == 'cerebras':
        return llm._call_cerebras(sys_p, usr_p, temp, fmt)
    else:
        return llm._call_groq(sys_p, usr_p, temp, fmt)

llm.call_llm = patch_call_llm

def safe_run_provider(name, task_type):
    print(f"\\n--- Testing Provider: {name} ---")
    url_tested = ""
    if name == "Gemini": url_tested = llm.GEMINI_API_URL
    elif name == "Groq": url_tested = llm.GROQ_API_URL
    elif name == "Cerebras": url_tested = llm.CEREBRAS_API_URL
    
    print(f"Path: {url_tested}")
    try:
        res = llm.call_llm(task_type, "You are a bot. Output the word SUCCESS loudly.", "Go.")
        print("Auth Succeeded: YES")
        print("Error: None")
        print("Parsing Succeeded: YES")
        if res and res.get("content"):
            print(f"Response sniff: {res['content'][:30].strip()}")
        return True
    except ValueError as val_e:
        print("Auth Succeeded: NO")
        print(f"Error: {val_e}")
        return False
    except RuntimeError as run_e:
        print("Auth Succeeded: UNKNOWN (API Error)")
        print(f"Error: {run_e}")
        return False
    except Exception as e:
        print("Auth Succeeded: FAIL / ERROR")
        print(f"Error: {str(e)}")
        return False

g_pass = safe_run_provider("Gemini", "extraction")
q_pass = safe_run_provider("Groq", "groq")
c_pass = safe_run_provider("Cerebras", "cerebras")

print("\\n--- Downstream Testing ---")
if g_pass:
    print("\\n[Testing Extractor]")
    try:
        text = "Cigna Rituximab Policy. Effective 02/01/2026. Prior authorization required. Step therapy required."
        out = extract_policy(text)
        print("Extractor PASS")
    except Exception as e:
        print(f"Extractor FAIL: {e}")
else:
    print("\\n[Skipping Extractor - Gemini Failed]")

if q_pass or c_pass:
    print("\\n[Testing RAG]")
    try:
        # If groq failed, let's explicitly fallback to cerebras for downstream tests or vice versa
        # I'll just use the default qa router if groq isn't passing 
        # Wait, I monkey-patched call_llm! So groq route will fail if q_pass=False. Let's unpatch if we want normal downstream 
        pass
    except Exception as e:
        pass

# Actually I'll restore call_llm for downstream tests if we have at least one valid key
import importlib
importlib.reload(llm)

if q_pass or c_pass:
    # If groq fails but cerebras works, normal llm.call_llm will fallback.
    print("\\n[Testing RAG (Downstream)]")
    try:
        r = rag_query("What does Cigna require?", [{"text": "Cigna requires PA.", "citation": "1"}])
        print("RAG PASS (Answer received)")
    except Exception as e:
        print(f"RAG FAIL: {e}")
        
    print("\\n[Testing Appeal (Downstream)]")
    try:
        lttr = generate_appeal_letter("Drugs", "Cigna", "Denied", "Requires PA")
        print("Appeal PASS (Letter generated)")
    except Exception as e:
        print(f"Appeal FAIL: {e}")
else:
    print("\\n[Skipping RAG and Appeal - Groq and Cerebras both Failed]")
