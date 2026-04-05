from app.db.scores import insert_payer_score, get_payer_rankings_for_drug

def test_insert_payer_score(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "sc1"}])
    monkeypatch.setattr("app.db.scores.get_supabase", lambda: mock)
    
    res = insert_payer_score("pol1", "UHC", "Keytruda", 8, "Strict PA")
    assert res == {"id": "sc1"}

def test_get_payer_rankings_for_drug(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"payer": "UHC", "score": 9}, {"payer": "Cigna", "score": 5}])
    monkeypatch.setattr("app.db.scores.get_supabase", lambda: mock)
    
    monkeypatch.setattr("app.db.scores.normalize_drug_identity", lambda *a: {"drug_name": "pembrolizumab", "brand_name": "Keytruda"})
    
    res = get_payer_rankings_for_drug("Keytruda")
    assert len(res) == 2
