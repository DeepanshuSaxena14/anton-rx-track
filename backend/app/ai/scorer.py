from typing import Dict, Any, List

def score_policy(pa_required: bool, step_therapy_required: bool, coverage_status: str, site_of_care: List[str]) -> Dict[str, Any]:
    """
    Deterministically scores a policy's restrictiveness without LLMs.
    Higher score = better/easier access (e.g. 100). Lower score = restricted (e.g. 0).
    """
    
    status = (coverage_status or "conditional").strip().lower()
    
    if status == "not_covered":
        return {
            "score": 0,
            "base_reason": "Policy explicitly states the drug is not covered."
        }
    
    score = 100
    reasons = []
    
    # Coverage baseline
    if status == "conditional":
        score -= 20
        reasons.append("Coverage is conditional, adding base hurdles.")
    
    # Hard blockers
    if pa_required is True:
        score -= 30
        reasons.append("Prior Authorization (PA) is explicitly required.")
        
    if step_therapy_required is True:
        score -= 40
        reasons.append("Step-therapy/Fail-first is explicitly required.")
        
    # Minor hurdles structure
    if site_of_care and isinstance(site_of_care, list):
        # E.g. restricting standard hospital infusion capabilities is an access hurdle
        if "hospital_outpatient" not in [s.lower() for s in site_of_care] and len(site_of_care) > 0:
             score -= 10
             reasons.append("Site of care is restricted (e.g. excluding hospital outpatient).")

    # Floor at 10 (if covered but heavily restricted)
    if score < 10:
        score = 10

    if score == 100:
        reasons.append("Drug appears covered with no explicit PA or Step Therapy restrictions defined in policy.")
        
    return {
        "score": score,
        "base_reason": " ".join(reasons)
    }
