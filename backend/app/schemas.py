import json
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict, Any

# 12-Field Core Model enforcing exact types
class PolicyData(BaseModel):
    model_config = ConfigDict(extra='forbid') # Reject hallucinated fields

    drug_name: Optional[str] = None
    brand_name: Optional[str] = None
    hcpcs_code: Optional[str] = None
    payer: Optional[str] = None
    coverage_status: Optional[str] = None
    covered_indications: Optional[List[str]] = None
    pa_required: Optional[bool] = None
    pa_criteria: Optional[List[str]] = None
    step_therapy_required: Optional[bool] = None
    step_therapy_details: Optional[List[str]] = None
    site_of_care: Optional[List[str]] = None
    effective_date: Optional[str] = Field(None, description="ISO Format Date String")

    @field_validator('covered_indications', 'pa_criteria', 'step_therapy_details', 'site_of_care', mode='before')
    @classmethod
    def parse_json_string(cls, v: Any) -> Any:
        if isinstance(v, str) and (v.strip().startswith('[') or v.strip().startswith('{')):
            try:
                return json.loads(v)
            except (ValueError, TypeError):
                return v
        return v

# Ingest Route
class IngestResponse(BaseModel):
    status: str
    message: str
    policies_extracted: int = 0
    errors: Optional[List[str]] = None

# Search & Query Router
class PolicyResult(BaseModel):
    id: str
    data: PolicyData

class SearchResponse(BaseModel):
    results: List[PolicyResult]

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    citations: List[str]

# Compare Router
class CompareResponse(BaseModel):
    drug_name: str
    comparison: List[PolicyData]

# Changes Router
class FieldChange(BaseModel):
    field: str
    old_value: Any
    new_value: Any

class ChangeSummary(BaseModel):
    version_old: str
    version_new: str
    diff_summary: str
    field_changes: List[FieldChange]

class ChangesResponse(BaseModel):
    history: List[ChangeSummary]

# Scores Router
class PayerScore(BaseModel):
    payer: str
    score: float
    reason: str

class ScoresResponse(BaseModel):
    drug_name: str
    scores: List[PayerScore]

# Appeal Router
class AppealRequest(BaseModel):
    drug: str
    payer: str
    denial_reason: str
    extra_context: Optional[str] = None

class AppealResponse(BaseModel):
    appeal_draft: str
    citations: List[str]
