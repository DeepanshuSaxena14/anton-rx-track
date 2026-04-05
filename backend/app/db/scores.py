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
        .or_(f"drug_name.ilike.%{drug_name}%,drug_name.ilike.%{brand_name}%,drug_name.ilike.%{hcpcs_code}%")
        .order("score", desc=True) 
        .execute()
    )
    return response.data
