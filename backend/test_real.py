import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

from app.ai.extractor import extract_policy

file_path = "/Users/smitpanchal/Desktop/anton-rx-track/backend/app/ai/test_input/cigna_excerpt.txt"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    results = extract_policy(text, source_filename="cigna_excerpt.txt")
    print(json.dumps(results, indent=2))
except Exception as e:
    print(f"Error during extraction: {e}")
