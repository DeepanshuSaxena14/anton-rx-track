import pytest
from app.db.normalizer import (
    normalize_payer,
    normalize_coverage_status,
    normalize_site_of_care,
    normalize_drug_identity,
)

def test_normalize_payer():
    assert normalize_payer("UnitedHealthcare") == "UHC"
    assert normalize_payer("united healthcare") == "UHC"
    assert normalize_payer("Cigna Healthcare") == "Cigna"
    assert normalize_payer("Blue Cross Blue Shield of North Carolina") == "BCBS NC"
    assert normalize_payer("Unknown Payer") == "Unknown Payer" # Silently falls back structurally correctly
    assert normalize_payer("") is None
    assert normalize_payer(None) is None

def test_normalize_drug_identity():
    # Keytruda alias checks
    res1 = normalize_drug_identity("keytruda", None, None)
    assert res1 == {"drug_name": "pembrolizumab", "brand_name": "Keytruda", "hcpcs_code": "J9271"}

    # Dupixent alias checks
    res2 = normalize_drug_identity(None, None, "j0173")
    assert res2 == {"drug_name": "dupilumab", "brand_name": "Dupixent", "hcpcs_code": "J0173"}

    # Pass-through checks
    res3 = normalize_drug_identity("NewDrug", None, None)
    assert res3 == {"drug_name": "NewDrug", "brand_name": None, "hcpcs_code": None}

def test_normalize_coverage_status():
    assert normalize_coverage_status("Covered") == "covered"
    assert normalize_coverage_status("Not Covered") == "not_covered"
    assert normalize_coverage_status("Covered with criteria") == "conditional"
    assert normalize_coverage_status(None) is None

def test_normalize_coverage_status_unknown_raises():
    with pytest.raises(ValueError, match="Invalid coverage_status"):
        normalize_coverage_status("Needs Documentation")

def test_normalize_site_of_care():
    res = normalize_site_of_care(["Hospital Outpatient", "physician office", "Home Infusion", "Physician Office"])
    assert res == ["hospital_outpatient", "physician_office", "home_infusion"]
    
    assert normalize_site_of_care(None) == []
    assert normalize_site_of_care([]) == []

def test_normalize_site_of_care_unknown():
    # WARNING: Current behavior replaces spaces with underscores dynamically instead of dropping/raising errors
    res = normalize_site_of_care(["local clinic"])
    assert res == ["local_clinic"]
