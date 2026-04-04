from typing import Dict, Any
import logging
from .llm_client import call_llm

logger = logging.getLogger(__name__)

APPEAL_SYSTEM_PROMPT = """You are a medical administrative assistant drafting a formal coverage appeal letter.
You MUST follow these strict rules:
1. ONLY utilize the policy evidence, drug name, and denial reason provided in the prompt.
2. DO NOT invent or hallucinate patient-specific medical facts (e.g., patient age, existing conditions, dates of treatment).
3. Where patient-specific facts are required for the letter flow, output literal placeholders: purely [PATIENT_NAME], [DOB], [CLINICIAN_NAME], [DATES_OF_SERVICE].
4. Explicitly connect the 'Denial Reason' to the relevant 'Policy Evidence' proving why the denial should be overturned.
5. Keep the tone highly formal, professional, and compliant.

Do not output JSON. Just output the final formatted string letter.
"""

def generate_appeal_letter(drug: str, payer: str, denial_reason: str, policy_evidence: str) -> str:
    """
    Generates a formal appeal letter grounded purely in provided logic avoiding hallucination.
    """
    user_prompt = f"""
Drug Involved: {drug}
Insurance Payer: {payer}
Stated Denial Reason: {denial_reason}

Pertinent Extract/Policy Evidence to leverage:
{policy_evidence}

Please draft the appeal letter now using placeholders for any missing patient specifics.
"""

    try:
        response = call_llm(
            task_type="appeal",
            system_prompt=APPEAL_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.0
        )
        return response.get("content", "Failed to generate appeal letter.")
    except Exception as e:
        logger.error(f"Appeal generation failed: {str(e)}")
        raise RuntimeError("Appeal generation failed.") from e
