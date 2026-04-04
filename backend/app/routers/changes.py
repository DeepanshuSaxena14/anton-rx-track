from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from app.schemas import ChangesResponse, ChangeSummary, FieldChange
from app.services import p2_fetch_versions, p1_diff_summary

router = APIRouter(prefix="/changes", tags=["changes"])

@router.get("", response_model=ChangesResponse)
async def get_changes(
    drug_name: str = Query(..., description="Drug name"),
    payer: str = Query(..., description="Payer name")
):
    """
    Surfaces version changes in structured and human-readable form.
    """
    if not drug_name or not payer:
        raise HTTPException(status_code=400, detail="Must provide drug_name and payer.")
        
    try:
        versions = p2_fetch_versions(drug=drug_name, payer=payer)
        
        if len(versions) < 2:
            return ChangesResponse(history=[])
            
        # Stubbing the version extraction. P2 versions should return PolicyData snapshots
        # We manually construct a dummy diff here since P2 returns empty arrays in the stub
        
        v_old = "2025-01-01"
        v_new = "2026-01-01"
        
        # P1 generates the plain English summary
        summary_text = p1_diff_summary("old text block", "new text block")
        
        diff = ChangeSummary(
            version_old=v_old,
            version_new=v_new,
            diff_summary=summary_text,
            field_changes=[
                FieldChange(field="pa_criteria", old_value="Must be 18+", new_value="Must be 21+")
            ]
        )
        
        return ChangesResponse(history=[diff])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Changes failed: {str(e)}")
