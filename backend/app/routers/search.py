from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import uuid

from app.schemas import SearchResponse, PolicyResult, QueryRequest, QueryResponse
from app.services import p2_fetch_policies_by_drug, p1_rag_query

router = APIRouter(tags=["search"])

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
    """
    if not (drug_name or brand_name or hcpcs_code):
        raise HTTPException(
            status_code=400, 
            detail="Must provide at least one search parameter: drug_name, brand_name, or hcpcs_code"
        )
        
    # We pass the primary search term to P2 helper. In a real scenario, P2 handles the OR logic.
    primary_term = drug_name or brand_name or hcpcs_code
    
    try:
        raw_policies = p2_fetch_policies_by_drug(drug_name=primary_term, payer=payer)
        
        results = []
        for p in raw_policies:
            results.append(PolicyResult(id=str(uuid.uuid4()), data=p))
            
        return SearchResponse(results=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/query", response_model=QueryResponse)
async def query_policies(req: QueryRequest):
    """
    Natural-language QA endpoint using P1's RAG stack.
    """
    if not req.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    try:
        # Dummy context retrieval (P2 embeddings search)
        context_chunks = [
            "Keytruda requires prior authorization.", 
            "No step therapy is required for J9271."
        ]
        citations = ["doc_123_page_1", "doc_123_page_2"]
        
        answer = p1_rag_query(req.question, context_chunks)
        
        return QueryResponse(answer=answer, citations=citations)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
