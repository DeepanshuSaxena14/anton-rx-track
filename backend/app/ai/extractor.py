import json
import logging
from typing import List, Dict, Any, Optional

from .llm_client import call_llm

logger = logging.getLogger(__name__)

# Decoupled schema definition for easy future extension (e.g., drug_category, access_status, dosing_limits).
POLICY_FIELDS = {
    "drug_name": "string | null",
    "brand_name": "string | null",
    "hcpcs_code": "string | null",
    "payer": "string | null",
    "coverage_status": "'covered' | 'not_covered' | 'conditional' | null",
    "covered_indications": "string[] | null",
    "pa_required": "boolean | null",
    "pa_criteria": "string[] | null",
    "step_therapy_required": "boolean | null",
    "step_therapy_details": "string[] | null",
    "site_of_care": "Array of ('hospital_outpatient' | 'physician_office' | 'home_infusion') | null",
    "effective_date": "string | null (ISO format)"
}

SYSTEM_PROMPT = f"""You are an exact clinical policy extractor. Your sole responsibility is to convert raw policy text into a highly structured JSON array.
NEVER summarize or paraphrase clinical criteria. Extract the exact wording.
If a field is not explicitly present in the text, you MUST return `null`. NEVER GUESS.

You MUST return an Array of JSON objects. Even if the text only describes one drug, return an array `[...]`.
Some PDFs are consolidated and contain multiple completely different drugs and step-therapy policies. In that case, return multiple objects in the array.

Schema per object:
{{
    "drug_name": "string | null",
    "brand_name": "string | null",
    "hcpcs_code": "string | null",
    "payer": "string | null",
    "coverage_status": "'covered' | 'not_covered' | 'conditional' | null",
    "covered_indications": "array of strings | null",
    "pa_required": "boolean | null",
    "pa_criteria": "array of strings | null",
    "step_therapy_required": "boolean | null",
    "step_therapy_details": "array of strings | null",
    "site_of_care": "array of ('hospital_outpatient' | 'physician_office' | 'home_infusion') | null",
    "effective_date": "string | null"
}}

Crucial Constraints:
1. `coverage_status` MUST strictly be one of: 'covered', 'not_covered', 'conditional', or null.
2. `pa_required` and `step_therapy_required` are distinct and separate. Evaluate them independently.
3. Check headers for `effective_date`.
4. Output valid JSON ONLY. No preamble, no explanation, no markdown ticks.
"""

def extract_policy(text: str, source_filename: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Core extraction function. Calls Gemini to convert raw text into our exact 12-field contract.
    Enforces Array output, null-safety, and JSON structure.
    """
    user_prompt = f"Source PDF Name: {source_filename or 'Unknown'}\n\nPolicy Text:\n{text}"
    
    # We ask Gemini to explicitly output a JSON format string.
    try:
        response = call_llm(
            task_type="extraction",
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.0,
            response_format={"type": "json_object"}
        )
    except Exception as e:
        logger.error(f"Extraction LLM call failed: {str(e)}")
        raise RuntimeError("Failed to extract policy text via LLM.") from e

    content = response.get("content", "")
    
    # Strip markdown codeblocks if LLM disobeys "no markdown" rule
    content = content.strip()
    if content.startswith("```json"):
        content = content[len("```json"):]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    try:
        parsed_data = json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON. Content dump: {content}")
        raise ValueError("Extraction yielded malformed JSON.") from e

    # Force array output
    if isinstance(parsed_data, dict):
        # Sometime LLMs wrap lists in an object like {"policies": [...]}
        keys = list(parsed_data.keys())
        if len(keys) == 1 and isinstance(parsed_data[keys[0]], list):
            parsed_data = parsed_data[keys[0]]
        else:
            parsed_data = [parsed_data]
            
    if not isinstance(parsed_data, list):
        raise ValueError(f"Extracted payload must be a list, got {type(parsed_data)}")

    # Post-parse cleanup & validation strictly bounding to the fields.
    cleaned_array = []
    allowed_keys = set(POLICY_FIELDS.keys())
    
    for obj in parsed_data:
        cleaned_obj = {}
        # Ensure ONLY allowed keys are present according to our decoupled schema definition.
        for key in allowed_keys:
            val = obj.get(key, None)
            
            # Additional type coercion for safety
            if isinstance(val, str) and val.strip().lower() == "null":
                val = None
                
            if isinstance(val, list) and len(val) == 0:
                val = None  # Normalize empty arrays to null per P1 standards

            if val == "":
                val = None

            cleaned_obj[key] = val
            
        cleaned_array.append(cleaned_obj)

    return cleaned_array
