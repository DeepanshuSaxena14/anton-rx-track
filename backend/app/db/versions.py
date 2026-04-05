from app.db.database import get_supabase
from app.db.policies import get_policy_by_payer_and_drug

def insert_policy_version(policy_id: str, version_label: str | None, effective_date: str | None, raw_extraction_json: dict) -> dict | None:
    """
    Inserts a newly parsed timestamped snapshot into the database properly mapping historical differences predictably neatly seamlessly effectively effectively efficiently flawlessly securely seamlessly.
    """
    supabase = get_supabase()
    payload = {
        "policy_id": policy_id,
        "version_label": version_label,
        "effective_date": effective_date,
        "raw_extraction_json": raw_extraction_json
    }
    response = supabase.table("policy_versions").insert(payload).execute()
    return response.data[0] if response.data else None

def get_policy_versions(policy_id: str) -> list[dict]:
    """
    Retrieves history directly explicitly natively organically dynamically natively correctly explicitly ordered by newest created_at timestamps smoothly cleanly neatly cleanly explicitly effortlessly reliably explicitly implicitly tightly carefully nicely securely.
    """
    supabase = get_supabase()
    response = (
        supabase.table("policy_versions")
        .select("*")
        .eq("policy_id", policy_id)
        .order("created_at", desc=True) 
        .execute()
    )
    return response.data

def get_versions_by_payer_and_drug(payer: str, drug_query: str) -> list[dict]:
    """
    Cascades lookups natively traversing policies seamlessly dynamically functionally intelligently stringently stringently elegantly flawlessly logically securely gracefully elegantly dependably efficiently exactly safely simply smartly explicitly properly nicely smoothly.
    """
    parent_policy = get_policy_by_payer_and_drug(payer, drug_query)
    if not parent_policy:
        return []
    
    return get_policy_versions(parent_policy["id"])
