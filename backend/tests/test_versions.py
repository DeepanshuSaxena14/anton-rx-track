from app.db.versions import insert_policy_version, get_policy_versions, get_versions_by_payer_and_drug

def test_insert_policy_version(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "v1"}])
    monkeypatch.setattr("app.db.versions.get_supabase", lambda: mock)
    res = insert_policy_version("pol1", "2023-01", "2023-01-01", {"status": "covered"})
    assert res == {"id": "v1"}

def test_get_policy_versions(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "v1"}, {"id": "v2"}])
    monkeypatch.setattr("app.db.versions.get_supabase", lambda: mock)
    res = get_policy_versions("pol1")
    assert len(res) == 2

def test_get_versions_by_payer_and_drug(monkeypatch, mock_supabase_client):
    # Mock for get_policy_by_payer_and_drug
    monkeypatch.setattr("app.db.versions.get_policy_by_payer_and_drug", lambda p, d: {"id": "pol1"})
    
    mock_sb = mock_supabase_client([{"id": "v1"}])
    monkeypatch.setattr("app.db.versions.get_supabase", lambda: mock_sb)
    
    res = get_versions_by_payer_and_drug("UHC", "Keytruda")
    assert len(res) == 1
    assert res[0]["id"] == "v1"
