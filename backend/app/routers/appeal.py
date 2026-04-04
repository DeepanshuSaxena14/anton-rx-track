from fastapi import APIRouter, HTTPException
from app.schemas import AppealRequest, AppealResponse
from app.services import p1_generate_appeal_letter

router = APIRouter(prefix="/appeal", tags=["appeal"])

@router.post("", response_model=AppealResponse)
async def generate_appeal(req: AppealRequest):
    """
    Drive backend-to-frontend workflow for appeal reasoning.
    """
    if not req.drug or not req.payer or not req.denial_reason:
        raise HTTPException(status_code=400, detail="Drug, payer, and denial_reason are required.")
        
    try:
        # Context combining
        full_context = f"Context: {req.extra_context}" if req.extra_context else "No extra context."
        
        # Call P1
        draft = p1_generate_appeal_letter(
            drug=req.drug, 
            denial_reason=req.denial_reason, 
            context=full_context
        )
        
        # We dummy out citations for the stub
        citations = ["section_prior_auth", "clinical_guideline_page_4"]
        
        return AppealResponse(
            appeal_draft=draft,
            citations=citations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Appeal generation failed: {str(e)}")
