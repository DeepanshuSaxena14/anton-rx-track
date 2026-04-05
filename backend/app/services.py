import json
from typing import List, Dict, Any

from app.schemas import PolicyData
from app.db.models import PolicyInsert

from app.ai.extractor import extract_policy as ai_extract
from app.ai.embedder import embed_text as ai_embed
from app.ai.rag import rag_query as ai_rag_query
from app.ai.diff import diff_summary as ai_diff_summary
from app.ai.scorer import score_policy as ai_score
from app.ai.appeal import generate_appeal_letter as ai_generate_appeal_letter

from app.db.storage import upload_pdf
from app.db.policies import insert_policy, get_policies_by_drug, get_all_policies, get_unique_payers, get_unique_drugs, get_policy_by_payer_and_drug
from app.db.versions import insert_policy_version, get_versions_by_payer_and_drug
from app.db.embeddings import insert_embeddings, search_similar_chunks
from app.db.scores import insert_payer_score, get_payer_rankings_for_drug, get_unique_scored_drugs
from app.db.normalizer import normalize_policy_payload

def p2_fetch_unique_payers() -> List[str]:
    return get_unique_payers()

def p2_fetch_unique_drugs() -> List[str]:
    return get_unique_drugs()

def p2_fetch_unique_scored_drugs() -> List[str]:
    return get_unique_scored_drugs()

def p1_extract_policy(text: str) -> List[Dict]:
    res = ai_extract(text)
    if isinstance(res, dict):
        return [res]
    return res

def p1_generate_embeddings(chunks: List[str]) -> List[List[float]]:
    if not chunks:
        return []
    return ai_embed(chunks)

def p1_compute_score(policy: PolicyData) -> Dict[str, Any]:
    return ai_score(
        pa_required=policy.pa_required,
        step_therapy_required=policy.step_therapy_required,
        coverage_status=policy.coverage_status,
        site_of_care=policy.site_of_care
    )

def p1_rag_query(question: str, context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Pass the rich list of chunks (text + citations) directly to the AI layer
    return ai_rag_query(question, context_chunks)

def p1_diff_summary(old_text: str, new_text: str) -> str:
    return ai_diff_summary(old_text, new_text)

def p1_generate_appeal_letter(drug: str, payer: str, denial_reason: str, context: str) -> str:
    return ai_generate_appeal_letter(drug, payer, denial_reason, context)

def p2_store_original_pdf(filename: str, pdf_bytes: bytes) -> str:
    res = upload_pdf(pdf_bytes, filename)
    return res.get("url")

def p2_store_policies(policies: List[PolicyData]) -> List[str]:
    record_ids = []
    for p in policies:
        dump = p.model_dump(mode="json")
        pi = PolicyInsert(**dump)
        rec = insert_policy(pi)
        if rec and "id" in rec:
            record_ids.append(rec["id"])
    return record_ids

def p2_store_version(record_ids: List[str], raw_json_data: List[Dict]):
    """Wires directly to insert_policy_version"""
    for i, rid in enumerate(record_ids):
        # We store the matching raw unstructured extraction for audit history
        raw_json = raw_json_data[i] if i < len(raw_json_data) else {}
        insert_policy_version(
            policy_id=rid,
            version_label="v1.0", 
            effective_date=raw_json.get("effective_date"),
            raw_extraction_json=raw_json
        )

def p2_store_embeddings(record_ids: List[str], chunks: List[str], embeddings_matrix: List[List[float]]):
    """Integrates raw chunks + embeddings mathematically into DB"""
    if not record_ids or not embeddings_matrix:
        return
        
    for rid in record_ids:
        chunk_payloads = []
        for index, emb in enumerate(embeddings_matrix):
            # Only map if chunk successfully matches mapping length natively
            if index < len(chunks):
                chunk_payloads.append({
                    "chunk_index": index,
                    "chunk_text": chunks[index],
                    "embedding": emb
                })
        insert_embeddings(rid, chunk_payloads)

def p2_search_embeddings(query: str, top_k: int = 5) -> List[Dict]:
    """Resolves exactly to the standard interface required natively."""
    query_vector = ai_embed([query])[0]
    
    # DB migration 002 returns: {"chunk_text": ..., "policy_id": ...} natively inside the RPC
    raw_results = search_similar_chunks(query_vector, limit=top_k)
    mapped = []
    
    if raw_results:
        for r in raw_results:
            mapped.append({
                "chunk": r.get("chunk_text") or r.get("text", ""),
                "citation": r.get("policy_id") or r.get("citation", "Unknown Record")
            })
    return mapped

def p2_normalize_policies(policies: List[Dict[str, Any]]) -> List[PolicyData]:
    """
    Safely converts raw data into strict PolicyData objects, ignoring internal DB fields.
    """
    valid_keys = PolicyData.model_fields.keys()
    out = []
    for p in policies:
        try:
            # If it's already a model, dump it; if it's a dict, filter it
            data = p.model_dump() if hasattr(p, "model_dump") else p
            clean_p = {k: v for k, v in data.items() if k in valid_keys}
            
            # Type Safeguard: Database column is 'text', so it might return stringified JSON
            st_details = clean_r = clean_p.get("step_therapy_details")
            if isinstance(st_details, str) and st_details.startswith("["):
                try:
                    clean_p["step_therapy_details"] = json.loads(st_details)
                except Exception:
                    pass

            n = normalize_policy_payload(clean_p)
            out.append(PolicyData(**n))
        except Exception:
            # Fallback to a filtered version if normalization or full validation fails
            try:
                data = p.model_dump() if hasattr(p, "model_dump") else p
                clean_p = {k: v for k, v in data.items() if k in valid_keys}
                
                # Apply same safeguard to fallback path
                st_details = clean_p.get("step_therapy_details")
                if isinstance(st_details, str) and st_details.startswith("["):
                    try:
                        clean_p["step_therapy_details"] = json.loads(st_details)
                    except Exception:
                        pass
                        
                out.append(PolicyData(**clean_p))
            except Exception:
                continue
    return out

def p2_store_score(record_id: str, payer: str, drug_name: str, score_data: Dict[str, Any]):
    return insert_payer_score(
        policy_id=record_id,
        payer=payer or "Unknown",
        drug_name=drug_name or "Unknown",
        score=score_data.get("score", 0),
        reason=score_data.get("base_reason")
    )

def p2_fetch_policies_by_drug(drug_name: str = None, brand_name: str = None, hcpcs_code: str = None, payer: str = None) -> List[PolicyData]:
    # Pass search routing back down natively
    query = drug_name or brand_name or hcpcs_code or "Unknown"
    
    if payer:
        # Strict mode: Only get the LATEST entry for this specific payer to prevent UI duplication in Compare/Changes
        record = get_policy_by_payer_and_drug(payer, query)
        records = [record] if record else []
    else:
        # General search mode: Return all matches (aliasing handled by P2 DB)
        records = get_policies_by_drug(query)
    
    mapped = []
    valid_keys = PolicyData.model_fields.keys()
    for r in records:
        # Filter out DB-only fields like 'id', 'policy_hash', etc.
        clean_r = {k: v for k, v in r.items() if k in valid_keys}
        
        # Type Safeguard for step_therapy_details (might be stringified JSON)
        st_details = clean_r.get("step_therapy_details")
        if isinstance(st_details, str) and st_details.startswith("["):
            try:
                clean_r["step_therapy_details"] = json.loads(st_details)
            except Exception:
                pass
                
        mapped.append(PolicyData(**clean_r))
    return mapped

def p2_fetch_versions(drug: str, payer: str) -> List[Any]:
    return get_versions_by_payer_and_drug(payer, drug)

def p2_fetch_rankings(drug: str) -> List[Dict]:
    return get_payer_rankings_for_drug(drug)
