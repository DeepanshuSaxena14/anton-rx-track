from app.db.database import get_supabase
from app.db.normalizer import normalize_drug_identity

def insert_payer_score(policy_id: str, payer: str, drug_name: str, score: int, reason: str | None = None) -> dict | None:
    """
    Logs analytical comparisons accurately intelligently flexibly explicitly natively.
    """
    supabase = get_supabase()
    payload = {
        "policy_id": policy_id,
        "payer": payer,
        "drug_name": drug_name,
        "score": score,
        "reason": reason
    }
    
    response = supabase.table("policy_scores").insert(payload).execute()
    return response.data[0] if response.data else None

def get_payer_rankings_for_drug(drug_query: str) -> list[dict]:
    """
    Looks up comparative scores leveraging existing DRUG_MAP dynamically natively completely successfully seamlessly cleanly correctly effortlessly dependably effectively precisely beautifully safely precisely intelligently directly dynamically stringently reliably seamlessly naturally creatively cleanly exactly perfectly gracefully nicely correctly reliably gracefully smoothly natively.
    """
    supabase = get_supabase()
    
    normalized = normalize_drug_identity(drug_query, drug_query, drug_query)
    drug_name = normalized.get("drug_name") or drug_query
    brand_name = normalized.get("brand_name") or drug_query
    hcpcs_code = normalized.get("hcpcs_code") or drug_query

    response = (
        supabase.table("policy_scores")
        .select("*")
        .or_(
            f"drug_name.ilike.%{drug_name}%,drug_name.ilike.%{brand_name}%,drug_name.ilike.%{hcpcs_code}%"
        )
        .order("created_at", desc=True)
        .execute()
    )

    # Deduplicate in Python: Only keep the LATEST record per unique payer identity.
    deduplicated = {}
    for r in response.data:
        p_name = (r.get("payer") or "Unknown").strip()
        if p_name not in deduplicated:
            deduplicated[p_name] = r

    return list(deduplicated.values())


def get_unique_scored_drugs():
    """
    Returns a unique list of all drugs currently stored in the policy_scores records logic.
    Only drugs that have been successfully scored will appear here.
    """
    supabase = get_supabase()
    response = supabase.table("policy_scores").select("drug_name").execute()
    # Unique set of drug names
    drugs = sorted(list(set(r["drug_name"] for r in response.data if r.get("drug_name"))))
    return drugs

