import json
from fastapi import APIRouter, Query, HTTPException

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
        
        # Need at least two to form a change event
        if len(versions) < 2:
            return ChangesResponse(history=[])
            
        changes = []
        # Calculate diffs between pairs sequentially
        for i in range(len(versions) - 1):
            old_ver = versions[i+1] # assuming 0 is newest
            new_ver = versions[i]
            
            # P1 converts raw comparison into a human string
            summary_text = p1_diff_summary(json.dumps(old_ver), json.dumps(new_ver))
            
            # Dummy field computation for the tuple
            changes.append(ChangeSummary(
                version_old=old_ver.get("version", "v1") if isinstance(old_ver, dict) else "v1",
                version_new=new_ver.get("version", "v2") if isinstance(new_ver, dict) else "v2",
                diff_summary=summary_text,
                field_changes=[
                    FieldChange(field="pa_criteria", old_value="old", new_value="new")
                ]
            ))
            
        return ChangesResponse(history=changes)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Changes failed: {str(e)}")
