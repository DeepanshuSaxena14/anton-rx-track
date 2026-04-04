import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

from app.ai.extractor import extract_policy

text = """Cigna Rituximab Policy
Effective Date: 02/01/2026
Rituximab is covered when prior authorization criteria are met.
Patients must have failed a preferred biosimilar first.
Use is approved for rheumatoid arthritis and lupus."""

try:
    results = extract_policy(text)
    print(json.dumps(results, indent=2))
except Exception as e:
    print(f"Error during extraction: {e}")
