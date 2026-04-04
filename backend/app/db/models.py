from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class PolicyInsert(BaseModel):
    drug_name: str | None = None
    brand_name: str | None = None
    hcpcs_code: str | None = None
    payer: str | None = None
    coverage_status: str | None = None
    covered_indications: list[str] = Field(default_factory=list)
    pa_required: bool | None = None
    pa_criteria: list[str] = Field(default_factory=list)
    step_therapy_required: bool | None = None
    step_therapy_details: str | None = None
    site_of_care: list[str] = Field(default_factory=list)
    effective_date: date | None = None

    source_file_name: str | None = None
    storage_path: str | None = None
    storage_url: str | None = None
    policy_text: str | None = None
    raw_extraction_json: dict[str, Any] = Field(default_factory=dict)


class PolicyRecord(PolicyInsert):
    id: str
    policy_hash: str
    created_at: datetime
    updated_at: datetime


class PolicyVersion(BaseModel):
    id: str | None = None
    policy_id: str
    version_label: str | None = None
    effective_date: date | None = None
    version_hash: str | None = None
    raw_extraction_json: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None


class PolicyEmbedding(BaseModel):
    id: str | None = None
    policy_id: str
    chunk_index: int
    chunk_text: str
    embedding: list[float]
    created_at: datetime | None = None


class PolicyScore(BaseModel):
    id: str | None = None
    policy_id: str
    payer: str
    drug_name: str
    score: int
    reason: str | None = None
    created_at: datetime | None = None