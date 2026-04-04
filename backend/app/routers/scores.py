from fastapi import APIRouter, Query, HTTPException
from app.schemas import ScoresResponse, PayerScore
from app.services import p2_fetch_rankings

router = APIRouter(prefix="/scores", tags=["scores"])

@router.get("", response_model=ScoresResponse)
async def get_scores(
    drug_name: str = Query(..., description="Drug name for leaderboard rankings")
):
    """
    Provide restrictiveness scoring leaderboard data.
    """
    if not drug_name:
        raise HTTPException(status_code=400, detail="Must provide drug_name.")
        
    try:
        raw_rankings = p2_fetch_rankings(drug=drug_name)
        
        # Sort them descending (highest score = most restrictive usually)
        sorted_rankings = sorted(
            raw_rankings, 
            key=lambda k: k.get("score", 0.0), 
            reverse=True
        )
        
        payer_scores = []
        for r in sorted_rankings:
            payer_scores.append(PayerScore(
                payer=r.get("payer", "Unknown"),
                score=r.get("score", 0.0),
                reason=r.get("reason", "No reason provided")
            ))
            
        return ScoresResponse(drug_name=drug_name, scores=payer_scores)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scores failed: {str(e)}")
