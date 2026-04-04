from datetime import date
import pytest
from pydantic import ValidationError
from app.db.models import PolicyInsert

def test_valid_policy_insert():
    policy = PolicyInsert(
        drug_name="pembrolizumab",
        payer="UHC",
        coverage_status="covered",
        effective_date=date(2023, 1, 1)
    )
    assert policy.drug_name == "pembrolizumab"
    assert policy.coverage_status == "covered"
    # defaults
    assert policy.covered_indications == []
    assert policy.raw_extraction_json == {}

def test_json_safe_serialization():
    policy = PolicyInsert(drug_name="Test", effective_date=date(2023, 1, 1))
    data = policy.model_dump(mode="json")
    assert data["drug_name"] == "Test"
    assert data["effective_date"] == "2023-01-01"  # Datetimes reliably serialize to string strings safely

def test_invalid_list_fields_rejected():
    with pytest.raises(ValidationError):
        PolicyInsert(covered_indications="This should be a list and will fail")

def test_invalid_coverage_status_rejected():
    with pytest.raises(ValidationError):
        PolicyInsert(coverage_status="pending review")  # Must be strictly exactly Literal permitted parameters

def test_invalid_date_rejected():
    with pytest.raises(ValidationError):
        PolicyInsert(effective_date="not a valid date")

def test_defaults_for_fields():
    policy = PolicyInsert()
    assert policy.drug_name is None
    assert policy.covered_indications == []
    assert policy.pa_criteria == []
    assert policy.site_of_care == []
    assert policy.raw_extraction_json == {}
