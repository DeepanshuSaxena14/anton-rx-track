from app.db.changes import compare_policy_versions, get_change_log_for_policy, get_change_log_by_payer_and_drug

def test_compare_policy_versions():
    old = {"coverage_status": "conditional", "pa_criteria": ["old_crit"]}
    new = {"coverage_status": "covered", "pa_criteria": ["old_crit", "new_crit"]}
    
    diff = compare_policy_versions(old, new)
    assert diff["coverage_status"] == {"old": "conditional", "new": "covered"}
    assert diff["pa_criteria_added"] == ["new_crit"]

def test_get_change_log_for_policy(monkeypatch):
    mock_versions = [
        {"effective_date": "2023-02-01", "version_label": "v2", "raw_extraction_json": {"coverage_status": "covered"}},
        {"effective_date": "2023-01-01", "version_label": "v1", "raw_extraction_json": {"coverage_status": "conditional"}}
    ]
    monkeypatch.setattr("app.db.changes.get_policy_versions", lambda p: mock_versions)
    
    logs = get_change_log_for_policy("pol1")
    assert len(logs) == 1
    assert logs[0]["changes"]["coverage_status"] == {"old": "conditional", "new": "covered"}

def test_get_change_log_by_payer_and_drug(monkeypatch):
    monkeypatch.setattr("app.db.changes.get_policy_by_payer_and_drug", lambda p, d: {"id": "pol1", "payer": "p", "drug_name": "d"})
    monkeypatch.setattr("app.db.changes.get_change_log_for_policy", lambda p: [{"changes": "test"}])
    
    res = get_change_log_by_payer_and_drug("UHC", "Keytruda")
    assert res["policy_id"] == "pol1"
    assert res["history"][0]["changes"] == "test"
