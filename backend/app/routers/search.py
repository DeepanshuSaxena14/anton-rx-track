from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
import uuid

from app.schemas import SearchResponse, PolicyResult, QueryRequest, QueryResponse
from app.services import (
    p2_fetch_policies_by_drug, 
    p1_rag_query, 
    p2_search_embeddings, 
    p2_fetch_unique_payers, 
    p2_fetch_unique_drugs
)

router = APIRouter(tags=["search"])

@router.get("/search/payers", response_model=List[str])
async def get_payers():
    return p2_fetch_unique_payers()

@router.get("/search/drugs", response_model=List[str])
async def get_drugs():
    return p2_fetch_unique_drugs()

# Simple stub alias resolver for the demo
ALIAS_MAP = {
    "keytruda": {"brand_name": "Keytruda", "drug_name": "pembrolizumab", "hcpcs_code": "J9271"},
    "pembrolizumab": {"brand_name": "Keytruda", "drug_name": "pembrolizumab", "hcpcs_code": "J9271"},
    "j9271": {"brand_name": "Keytruda", "drug_name": "pembrolizumab", "hcpcs_code": "J9271"},
}

@router.get("/search", response_model=SearchResponse)
async def search_policies(
    drug_name: Optional[str] = Query(None, description="Search by generic drug name"),
    brand_name: Optional[str] = Query(None, description="Search by brand name"),
    hcpcs_code: Optional[str] = Query(None, description="Search by HCPCS code"),
    payer: Optional[str] = Query(None, description="Filter by specific payer")
):
    """
    Structured search endpoint returning the 12-field policy schema.
    Retrieves data directly from P2 DB.
    Combats aliasing.
    """
    if not (drug_name or brand_name or hcpcs_code):
        raise HTTPException(
            status_code=400, 
            detail="Must provide at least one search parameter: drug_name, brand_name, or hcpcs_code"
        )
        
    primary_term = (drug_name or brand_name or hcpcs_code).lower()
    
    # Resolve aliases if known
    resolved_params = ALIAS_MAP.get(primary_term, {
        "drug_name": drug_name, 
        "brand_name": brand_name, 
        "hcpcs_code": hcpcs_code
    })
    
    try:
        raw_policies = p2_fetch_policies_by_drug(
            drug_name=resolved_params.get("drug_name"),
            brand_name=resolved_params.get("brand_name"),
            hcpcs_code=resolved_params.get("hcpcs_code"),
            payer=payer
        )
        
        # Deduplicate: Only return the latest version (by effective_date) for each unique (payer, drug)
        # 1. Sort by effective_date descending
        raw_policies.sort(key=lambda x: x.effective_date or "", reverse=True)

        results = []
        seen = set() # (payer, drug_name)
        
        for p in raw_policies:
            if not p.payer or not p.drug_name:
                results.append(PolicyResult(id=str(uuid.uuid4()), data=p))
                continue
                
            key = (p.payer.lower().strip(), p.drug_name.lower().strip())
            if key not in seen:
                results.append(PolicyResult(id=str(uuid.uuid4()), data=p))
                seen.add(key)
            
        return SearchResponse(results=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/query", response_model=QueryResponse)
async def query_policies(req: QueryRequest):
    """
    Natural-language QA endpoint using P1's RAG stack.
    Fetches genuine chunk embeddings from P2 to drive P1 response.
    """
    if not req.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    try:
        # Retrieve REAL chunks using P2 embeddings interface
        retrieved_items = p2_search_embeddings(req.question, top_k=10)
        
        # Convert 'chunk' to 'text' to match the schema expected by ai/rag.py
        context_chunks = [{"text": item["chunk"], "citation": item["citation"]} for item in retrieved_items]
        
        # p1_rag_query now returns a rich Dict {answer: str, citations: List[str], ...}
        rag_res = p1_rag_query(req.question, context_chunks)
        
        return QueryResponse(
            answer=rag_res.get("answer", ""), 
            citations=rag_res.get("citations", [])
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
