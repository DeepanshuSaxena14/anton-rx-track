from fastapi import APIRouter, Query, HTTPException
from typing import List

from app.schemas import CompareResponse
from app.services import p2_fetch_policies_by_drug, p2_normalize_policies

router = APIRouter(prefix="/compare", tags=["compare"])

@router.get("", response_model=CompareResponse)
async def compare_policies(
    drug_name: str = Query(..., description="The drug to compare policies for"),
    payers: List[str] = Query(..., description="List of payers to compare")
):
    """
    Apples-to-apples comparison across multiple plans for the same drug.
    """
    if not drug_name or not payers:
        raise HTTPException(status_code=400, detail="Must provide drug_name and at least one payer.")
        
    try:
        raw_policies = []
        for payer in payers:
            found = p2_fetch_policies_by_drug(drug_name=drug_name, payer=payer)
            if found:
                raw_policies.extend(found)
                
        # Normalizer strictly preserves 12-field layout and exact constraint strings
        normalized = p2_normalize_policies(raw_policies)
        
        return CompareResponse(
            drug_name=drug_name,
            comparison=normalized
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compare failed: {str(e)}")
