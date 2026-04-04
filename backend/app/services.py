from typing import List, Dict, Any
from app.schemas import PolicyData
import json

# --- P1: AI / Extraction / Inference ---

def p1_extract_policy(text: str) -> List[Dict]:
    """
    (P1 Dummy) Extracts policy data from text into a list of unstructured dictionaries.
    P4 validators will enforce the schema on this output.
    """
    return [{
        "drug_name": "Keytruda",
        "brand_name": "Keytruda",
        "pa_required": True,
        "step_therapy_required": False
    }]

def p1_generate_embeddings(chunks: List[str]) -> List[List[float]]:
    """(P1 Dummy) Turns chunks into embeddings."""
    return [[0.1, 0.2, 0.3] for _ in chunks]

def p1_compute_score(policy: PolicyData) -> float:
    """(P1 Dummy) Computes restrictiveness score."""
    return 7.5

def p1_rag_query(question: str, context_chunks: List[str]) -> str:
    """(P1 Dummy) RAG answer generation."""
    return f"Based on the policies, here is the answer to: {question}"

def p1_compare_policies(policies: List[PolicyData]) -> List[PolicyData]:
    """(P1 Dummy) Normalizes output across multiple policies. (Or maybe this is P2?)"""
    return policies

def p1_diff_summary(old_text: str, new_text: str) -> str:
    """(P1 Dummy) Generates plain English summary of a change."""
    return "The prior authorization age limit was increased from 18 to 21."

def p1_generate_appeal_letter(drug: str, denial_reason: str, context: str) -> str:
    """(P1 Dummy) Generates a draft appeal letter."""
    return f"Dear Payer, we appeal the denial of {drug} for reason: {denial_reason}."


# --- P2: DB / Normalization / Storage ---

def p2_store_original_pdf(filename: str, pdf_bytes: bytes) -> str:
    """(P2 Dummy) Stores raw PDF and returns a storage URI."""
    return f"s3://anton-rx-track/pdfs/{filename}"

def p2_store_policies(policies: List[PolicyData]) -> List[str]:
    """(P2 Dummy) Inserts policies. Handles dedup. Returns list of record IDs."""
    return ["pol_12345"]

def p2_store_version(record_ids: List[str]):
    """(P2 Dummy) Inserts tracking versions for historical comparison."""
    pass

def p2_store_embeddings(record_ids: List[str], chunk_embeddings: List[List[float]]):
    """(P2 Dummy) Stores vector embeddings tied to policy records."""
    pass

def p2_search_embeddings(query: str, top_k: int = 5) -> List[Dict]:
    """(P2 Dummy) Performs vector search and returns literal chunks + citations."""
    return [{"chunk": "Requires PA.", "citation": "doc_123#page1"}]

def p2_normalize_policies(policies: List[PolicyData]) -> List[PolicyData]:
    """(P2 Dummy) Normalizes side-by-side data."""
    return policies

def p2_store_score(record_id: str, score: float):
    """(P2 Dummy) Stores the computed restrictiveness score."""
    pass

def p2_fetch_policies_by_drug(drug_name: str = None, brand_name: str = None, hcpcs_code: str = None, payer: str = None) -> List[PolicyData]:
    """(P2 Dummy) DB retrieval for search."""
    return [PolicyData(
        drug_name=drug_name or "Keytruda", 
        brand_name=brand_name or "Keytruda",
        hcpcs_code=hcpcs_code or "J9271",
        payer="Medicare" if not payer else payer,
        pa_required=True,
        effective_date="2026-01-01"
    )]

def p2_fetch_versions(drug: str, payer: str) -> List[Any]:
    """(P2 Dummy) Returns version history."""
    return []

def p2_fetch_rankings(drug: str) -> List[Dict]:
    """(P2 Dummy) Returns pre-calculated rankings."""
    return [{"payer": "Medicare", "score": 7.5, "reason": "Requires PA but no ST."}]
