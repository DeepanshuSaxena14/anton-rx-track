import json
import logging
import re
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
    "pa_criteria_summary": "string | null (concise clinical summary)",
    "step_therapy_required": "boolean | null",
    "step_therapy_details": "string[] | null",
    "site_of_care": "Array of ('hospital_outpatient' | 'physician_office' | 'home_infusion') | null",
    "effective_date": "string | null (ISO format)"
}

SYSTEM_PROMPT = f"""You are an exact clinical policy extractor. Your sole responsibility is to convert raw policy text into a highly structured JSON array.
Do not hallucinate facts beyond the source text, but you MUST extract criteria in a concise, compact, and structured manner.
If a field is not explicitly present in the text, you MUST return `null`. NEVER GUESS.

You MUST return an Array of JSON objects. Even if the text only describes one drug, return an array `[...]`.
Some PDFs are consolidated and contain multiple distinct drugs or step-therapy policies. Return a separate JSON object for each specific drug/biosimilar.

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
    "pa_criteria_summary": "string | null (concise 1-2 sentence clinical summary)",
    "step_therapy_required": "boolean | null",
    "step_therapy_details": "array of strings | null",
    "site_of_care": "array of ('hospital_outpatient' | 'physician_office' | 'home_infusion') | null",
    "effective_date": "string (format strictly as ISO YYYY-MM-DD) | null"
}}

Crucial Constraints:
1. `coverage_status` MUST strictly be one of: 'covered', 'not_covered', 'conditional', or null.
2. `pa_required` and `step_therapy_required` are distinct and separate. Evaluate them independently.
3. Check headers for `effective_date`. If found, ALWAYS normalize the output to ISO `YYYY-MM-DD` format.
4. Standardize `drug_name` strictly to lowercase generic names (e.g., 'rituximab'). Standardize `brand_name` strictly to Title Case (e.g., 'Rituxan').
5. Normalize `payer` to its primary core recognizable name by stripping trailing corporate entities (e.g., return "Cigna" instead of "Cigna Companies", "UHC" instead of "UnitedHealthcare Insurance", etc.).
6. For `pa_criteria`: Do NOT copy huge policy sections verbatim. Extract ONLY the specific, decision-focused approval criteria bullets relevant to the current product. Be concise.
7. For `pa_criteria_summary`: Generate a high-level, human-readable summary (1-2 sentences) of the medical necessity criteria. Focus on the core requirement (e.g., "Approval requires a diagnosis of rheumatoid arthritis and failure of at least one conventional DMARD").
8. For `covered_indications`: Include ONLY the specific indications relevant and approved for the CURRENT product object context, not the entire list of all indications in the document if they do not apply.
9. Output valid JSON ONLY. No preamble, no explanation, no markdown ticks.
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
    
    # Robustly find the JSON structure within the response (handles preamble/postamble)
    start_idx = content.find("[")
    alt_start = content.find("{")
    if alt_start != -1 and (start_idx == -1 or alt_start < start_idx):
        start_idx = alt_start

    end_idx = content.rfind("]")
    alt_end = content.rfind("}")
    if alt_end != -1 and (end_idx == -1 or alt_end > end_idx):
        end_idx = alt_end

    if start_idx == -1 or end_idx == -1:
        logger.error(f"No JSON boundary found in LLM output. Content: {content}")
        raise ValueError("Extraction yielded no valid JSON structure.")

    # Slice out the core JSON block
    content = content[start_idx : end_idx + 1]
    
    try:
        parsed_data = json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON block. Content dump: {content}")
        raise ValueError("Extraction yielded malformed JSON. Please try again.")

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
            expected_type_raw = POLICY_FIELDS.get(key, "string")
            
            # Coerce lists into strings if the schema expects a single string (Auto-Flattening)
            if "string" in expected_type_raw and "[]" not in expected_type_raw and isinstance(val, list):
                val = ", ".join([str(v) for v in val if v])
                
            # Coerce strings into lists if the schema expects an array (Auto-Wrapping)
            if ("[]" in expected_type_raw or "array" in expected_type_raw or "list" in expected_type_raw) and isinstance(val, str):
                if val.strip():
                    # If it looks like a bulleted list in a single string, split it; otherwise wrap it
                    if "\n" in val or "1." in val or "•" in val:
                        val = [i.strip().lstrip("•-›").strip() for i in re.split(r'\n|\d+\.|\-|•', val) if i.strip()]
                    else:
                        val = [val.strip()]
                else:
                    val = None

            # Normalize 'null' strings or empty values
            if isinstance(val, str) and val.strip().lower() == "null":
                val = None
                
            if isinstance(val, list) and len(val) == 0:
                val = None  # Normalize empty arrays to null per standards

            if val == "" or val == []:
                val = None

            cleaned_obj[key] = val
            
        cleaned_array.append(cleaned_obj)

    return cleaned_array
