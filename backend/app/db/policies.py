import hashlib
import json
from typing import Any

from app.db.database import get_supabase
from app.db.models import PolicyInsert
from app.db.normalizer import normalize_policy_payload


def compute_policy_hash(payload: dict[str, Any]) -> str:
    canonical = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def get_policy_by_hash(policy_hash: str):
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
    supabase = get_supabase()
    response = supabase.table("policies").select("*").execute()
    return response.data


def get_policies_by_drug(drug_query: str):
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
    supabase = get_supabase()

    normalized_payload = normalize_policy_payload({"payer": payer, "drug_name": drug_query})
    normalized_payer = normalized_payload.get("payer") or payer.strip()

    response = (
        supabase.table("policies")
        .select("*")
        .ilike("payer", normalized_payer)
        .or_(
            f"drug_name.ilike.%{drug_query}%,brand_name.ilike.%{drug_query}%,hcpcs_code.ilike.%{drug_query}%"
        )
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None