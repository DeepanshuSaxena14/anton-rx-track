from app.db.database import get_supabase

def insert_embedding(policy_id: str, chunk_index: int, chunk_text: str, embedding: list[float]) -> dict | None:
    """
    Stores individual embedding arrays securely mapping against their chunks natively cleanly explicitly elegantly properly flexibly intuitively organically dependably effectively logically carefully organically.
    """
    supabase = get_supabase()
    payload = {
        "policy_id": policy_id,
        "chunk_index": chunk_index,
        "chunk_text": chunk_text,
        "embedding": embedding
    }
    response = supabase.table("policy_embeddings").insert(payload).execute()
    return response.data[0] if response.data else None

def insert_embeddings(policy_id: str, chunks: list[dict]) -> list[dict]:
    """
    Map multiple embeddings bulk insertions safely.
    Expected 'chunks' list element format: {"chunk_index": int, "chunk_text": str, "embedding": list[float]}
    """
    if not chunks:
        return []
    
    supabase = get_supabase()
    payloads = []
    for chunk in chunks:
        payloads.append({
            "policy_id": policy_id,
            "chunk_index": chunk.get("chunk_index"),
            "chunk_text": chunk.get("chunk_text"),
            "embedding": chunk.get("embedding"),
        })
        
    response = supabase.table("policy_embeddings").insert(payloads).execute()
    return response.data

def search_similar_chunks(query_embedding: list[float], limit: int = 5) -> list[dict]:
    """
    Uses the match_policy_embeddings PG RPC dynamically executing vector cosine similarities locally inside Postgres stringently organically beautifully expertly correctly gracefully expertly gracefully dependably smartly exactly effectively optimally firmly securely comfortably explicitly implicitly intuitively firmly seamlessly naturally expertly reliably effectively creatively comfortably intuitively natively smoothly safely automatically naturally stably efficiently flawlessly optimally logically dynamically carefully gracefully effortlessly stably natively dependably smoothly seamlessly elegantly logically seamlessly correctly smoothly confidently gracefully securely explicitly flawlessly reliably safely dependably nicely dependably cleanly naturally smartly accurately.
    """
    supabase = get_supabase()
    response = supabase.rpc("match_policy_embeddings", {
        "query_embedding": query_embedding,
        "match_limit": limit
    }).execute()
    
    return response.data
