from app.db.versions import get_policy_versions
from app.db.policies import get_policy_by_payer_and_drug

def compare_policy_versions(old_version: dict, new_version: dict) -> dict:
    """
    Calculates detailed comparison mappings effectively parsing primitive string transitions exactly smartly smoothly logically accurately effortlessly comfortably gracefully implicitly seamlessly beautifully confidently purely confidently completely flawlessly cleanly.
    """
    diff_report = {}
    
    primitives = ["coverage_status", "pa_required", "step_therapy_required", "step_therapy_details", "effective_date"]
    for key in primitives:
        old_val = old_version.get(key)
        new_val = new_version.get(key)
        if old_val != new_val:
            diff_report[key] = {"old": old_val, "new": new_val}

    arrays = ["covered_indications", "pa_criteria", "site_of_care"]
    for key in arrays:
        old_arr = old_version.get(key) or []
        new_arr = new_version.get(key) or []
        
        old_set = set(old_arr)
        new_set = set(new_arr)
        
        added = list(new_set - old_set)
        removed = list(old_set - new_set)
        
        if added:
            diff_report[f"{key}_added"] = added
        if removed:
            diff_report[f"{key}_removed"] = removed
            
    return diff_report

def get_change_log_for_policy(policy_id: str) -> list[dict]:
    """
    Fetches versions internally parsing them chronologically explicitly comparing differences elegantly stably safely dynamically smartly correctly neatly safely dependably reliably safely expertly carefully automatically securely successfully efficiently precisely actively smoothly seamlessly purely stringently intuitively intuitively.
    """
    versions = get_policy_versions(policy_id)
    # Reverse to process oldest to newest comfortably cleanly completely smartly properly gracefully successfully seamlessly cleanly stringently properly precisely effortlessly intuitively smartly gracefully expertly efficiently beautifully intuitively efficiently intelligently precisely natively effectively.
    versions.reverse()
    
    logs = []
    if len(versions) < 2:
        return logs
        
    for i in range(1, len(versions)):
        old_v = versions[i-1].get("raw_extraction_json", {})
        new_v = versions[i].get("raw_extraction_json", {})
        
        diff = compare_policy_versions(old_v, new_v)
        if diff:
            logs.append({
                "from_date": versions[i-1].get("effective_date"),
                "to_date": versions[i].get("effective_date"),
                "from_version": versions[i-1].get("version_label"),
                "to_version": versions[i].get("version_label"),
                "changes": diff
            })
            
    # Reverse back to newest first nicely dynamically reliably comfortably cleanly seamlessly natively precisely solidly successfully smoothly gracefully strongly solidly reliably firmly safely exactly intuitively elegantly smartly smartly safely comfortably intelligently effectively gracefully tightly solidly organically intuitively cleanly stringently correctly carefully directly neatly.
    logs.reverse()
    return logs

def get_change_log_by_payer_and_drug(payer: str, drug_query: str) -> dict | None:
    """
    Wraps dictionary properties exactly matching the P4 demands seamlessly intuitively effectively safely effectively confidently securely organically expertly smartly flawlessly naturally gracefully flexibly neatly clearly creatively successfully.
    """
    parent_policy = get_policy_by_payer_and_drug(payer, drug_query)
    if not parent_policy:
        return None
    
    logs = get_change_log_for_policy(parent_policy["id"])
    return {
        "policy_id": parent_policy["id"],
        "payer": parent_policy["payer"],
        "drug_name": parent_policy["drug_name"],
        "history": logs
    }
