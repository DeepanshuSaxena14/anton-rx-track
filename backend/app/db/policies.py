import hashlib
import json
from typing import Any

from app.db.database import get_supabase
from app.db.models import PolicyInsert
from app.db.normalizer import normalize_policy_payload


def compute_policy_hash(payload: dict[str, Any]) -> str:
    """
    Computes a deterministic hash for a given policy dictionary payload.
    Used for duplicate detection.
    """
    canonical = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def get_policy_by_hash(policy_hash: str):
    """
    Retrieves exactly one policy record matching the provided deterministic hash.
    Returns the dictionary record if found, otherwise None.
    """
    supabase = get_supabase()
    response = (
        supabase.table("policies")
        .select("*")
        .eq("policy_hash", policy_hash)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def insert_policy(policy: PolicyInsert):
    """
    Normalizes and inserts a new extracted policy to the database.
    Checks for collisions via a computed hash to safely prevent duplicates.
    Returns the newly inserted database row dictionary.
    """
    supabase = get_supabase()

    policy_payload = policy.model_dump(mode="json")
    normalized_payload = normalize_policy_payload(policy_payload)
    policy_hash = compute_policy_hash(normalized_payload)

    existing = get_policy_by_hash(policy_hash)
    if existing:
        return existing

    insert_payload = {
        **normalized_payload,
        "policy_hash": policy_hash,
    }

    response = supabase.table("policies").insert(insert_payload).execute()
    return response.data[0] if response.data else None


def get_all_policies():
    """
    Fetches unconditionally all policies present safely inside the database.
    Useful for index listing or blanket evaluations.
    """
    supabase = get_supabase()
    response = supabase.table("policies").select("*").execute()
    return response.data


def get_policies_by_drug(drug_query: str):
    """
    Looks up and returns a list of all normalized policies associated with a drug.
    Matches across generic names, brand names, and HCPCS codes natively.
    """
    supabase = get_supabase()
    q = drug_query.strip()

    response = (
        supabase.table("policies")
        .select("*")
        .or_(f"drug_name.ilike.%{q}%,brand_name.ilike.%{q}%,hcpcs_code.ilike.%{q}%")
        .execute()
    )
    return response.data


def get_policy_by_payer_and_drug(payer: str, drug_query: str):
    """
    Resolves the targeted, latest effective policy explicitly tied to the exact 
    payer and drug identities provided. Perfectly utilized for stable record extraction.
    """
    supabase = get_supabase()

    normalized_payload = normalize_policy_payload({"payer": payer, "drug_name": drug_query})
    normalized_payer = normalized_payload.get("payer") or payer.strip()

    drug_name = normalized_payload.get("drug_name") or drug_query
    brand_name = normalized_payload.get("brand_name") or drug_query
    hcpcs_code = normalized_payload.get("hcpcs_code") or drug_query

    response = (
        supabase.table("policies")
        .select("*")
        .ilike("payer", normalized_payer)
        .or_(
            f"drug_name.ilike.%{drug_name}%,brand_name.ilike.%{brand_name}%,hcpcs_code.ilike.%{hcpcs_code}%"
        )
        .order("effective_date", desc=True)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def get_unique_payers():
    """
    Returns a unique list of all payers currently stored in the policies records logic.
    """
    supabase = get_supabase()
    response = supabase.table("policies").select("payer").execute()
    # Unique set of payers
    payers = sorted(list(set(r["payer"] for r in response.data if r.get("payer"))))
    return payers


def get_unique_drugs():
    """
    Returns a unique list of all drugs (brand_name) currently stored in the policies records natively.
    """
    supabase = get_supabase()
    response = supabase.table("policies").select("brand_name", "drug_name").execute()
    
    # We'll use brand_name as the primary label for the UI, fallback to drug_name
    drugs = []
    seen = set()
    for r in response.data:
        label = r.get("brand_name") or r.get("drug_name")
        if label and label not in seen:
            drugs.append(label)
            seen.add(label)
            
    return sorted(drugs)