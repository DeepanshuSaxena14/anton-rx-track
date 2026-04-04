from fastapi import APIRouter, HTTPException
from app.schemas import AppealRequest, AppealResponse
from app.services import p1_generate_appeal_letter, p2_search_embeddings

router = APIRouter(prefix="/appeal", tags=["appeal"])

@router.post("", response_model=AppealResponse)
async def generate_appeal(req: AppealRequest):
    """
    Drive backend-to-frontend workflow for appeal reasoning based on RAG.
    """
    if not req.drug or not req.payer or not req.denial_reason:
        raise HTTPException(status_code=400, detail="Drug, payer, and denial_reason are required.")
        
    try:
        # Construct search query to find the exact rules violated
        search_query = f"{req.drug} {req.payer} denial for: {req.denial_reason}"
        if req.extra_context:
            search_query += f" Context: {req.extra_context}"
            
        # Retrieve relevant chunks from P2 embeddings
        retrieved_items = p2_search_embeddings(search_query, top_k=3)
        
        # Build payload for P1
        real_chunks = "\n".join([item["chunk"] for item in retrieved_items])
        citations = [item["citation"] for item in retrieved_items if "citation" in item]
        
        # Call P1
        draft = p1_generate_appeal_letter(
            drug=req.drug, 
            denial_reason=req.denial_reason, 
            context=real_chunks
        )
        
        return AppealResponse(
            appeal_draft=draft,
            citations=citations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Appeal generation failed: {str(e)}")
