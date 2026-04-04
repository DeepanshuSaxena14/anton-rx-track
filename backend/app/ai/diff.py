from typing import Dict, Any, List
import logging
import json

from .llm_client import call_llm

logger = logging.getLogger(__name__)

DIFF_SYSTEM_PROMPT = """You are a market access analyst assistant.
Your job is to summarize changes between two versions of a clinical policy into a plain-English, executive summary paragraph.
Only focus on the *semantic clinical changes* provided to you in the structured diff (e.g., shifts in PA requirements, coverage status, step therapy criteria, or explicit site of care limitations). Ignore non-clinical or minor formatting differences.

Output a JSON object with 'summary' (a concise string paragraph explaining the business/access impact) and 'severity' ("high", "medium", or "low" based on the severity of the access change).
"""

def diff_summary(old_json: Dict[str, Any], new_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes substantive changes between two structured JSON variants and generates a clinical/business summary.
    """
    # Deterministic dictionary comparison
    # We only pass substantive fields explicitly mentioned in the contract to the LLM to filter cosmetic changes.
    critical_fields = [
        "coverage_status", 
        "pa_required", 
        "pa_criteria", 
        "step_therapy_required", 
        "step_therapy_details", 
        "covered_indications", 
        "site_of_care"
    ]
    
    changed_fields = []
    diff_details = {}
    
    for field in critical_fields:
        old_val = old_json.get(field)
        new_val = new_json.get(field)
        
        # Handle lists explicitly
        if isinstance(old_val, list) and isinstance(new_val, list):
            old_set = set(str(v).strip().lower() for v in old_val)
            new_set = set(str(v).strip().lower() for v in new_val)
            if old_set != new_set:
                changed_fields.append(field)
                diff_details[field] = {"old": old_val, "new": new_val}
        else:
            if old_val != new_val:
                changed_fields.append(field)
                diff_details[field] = {"old": old_val, "new": new_val}

    if not changed_fields:
        return {
            "summary": "No substantive clinical or coverage changes detected.",
            "severity": "low",
            "changed_fields": [],
            "used_fallback": False
        }

    user_prompt = f"The following fields had substantive changes:\n{json.dumps(diff_details, indent=2)}\n\nPlease summarize the business/clinical access impact."

    try:
        response = call_llm(
            task_type="diff",
            system_prompt=DIFF_SYSTEM_PROMPT,
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
            "summary": parsed.get("summary", "Changes detected but summarization failed."),
            "severity": parsed.get("severity", "medium"),
            "changed_fields": changed_fields,
            "used_fallback": response.get("provider") == "cerebras",
            "provider": response.get("provider")
        }
        
    except Exception as e:
        logger.error(f"Diff summarization LLM call failed: {str(e)}")
        # Deterministic fallback mechanism
        return {
            "summary": f"Detected changes in: {', '.join(changed_fields)}",
            "severity": "medium",
            "changed_fields": changed_fields,
            "used_fallback": True
        }
