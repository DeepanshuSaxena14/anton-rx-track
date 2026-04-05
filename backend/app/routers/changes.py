import json
import uuid
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
            
            changes.append(ChangeSummary(
                id=str(uuid.uuid4()),
                date=str(new_ver.get("created_at") or new_ver.get("effective_date") or "2024-01-01"),
                payer=payer,
                drug=drug_name,
                type="criteria_changed", 
                version_old=old_ver.get("version_label", "v1"),
                version_new=new_ver.get("version_label", "v2"),
                diff_summary=str(summary_text),
                field_changes=[
                    FieldChange(field="policy", old_value="Previous Version", new_value="Updated Version")
                ],
                previous=json.dumps(old_ver.get("raw_extraction_json", {})),
                current=json.dumps(new_ver.get("raw_extraction_json", {}))
            ))
            
        return ChangesResponse(history=changes)
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Changes failed: {str(e)}")
