import pytest
from app.db.models import PolicyInsert
from app.db.policies import (
    compute_policy_hash,
    insert_policy,
    get_policy_by_hash,
    get_all_policies,
    get_policies_by_drug,
    get_policy_by_payer_and_drug,
)

def test_compute_policy_hash():
    p1 = {"a": 1, "b": "test"}
    p2 = {"b": "test", "a": 1}
    # Deterministic keys verification
    assert compute_policy_hash(p1) == compute_policy_hash(p2)

def test_get_policy_by_hash(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "123", "policy_hash": "abc"}])
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock)
    
    res = get_policy_by_hash("abc")
    assert res == {"id": "123", "policy_hash": "abc"}

def test_get_policy_by_hash_not_found(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([])
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock)
    
    res = get_policy_by_hash("abc")
    assert res is None

def test_insert_policy_new(monkeypatch, mock_supabase_client):
    class DualMockSupabase:
        def __init__(self):
            self.call_count = 0
            
        def table(self, *a, **k): return self
        def select(self, *a, **k): return self
        def eq(self, *a, **k): return self
        def limit(self, *a, **k): return self
        def insert(self, *a, **k): return self
        def execute(self):
            self.call_count += 1
            # Step 1: collision lookup (empty), Step 2: successful insertion
            if self.call_count == 1:
                return type("DataObj", (), {"data": []})()
            else:
                return type("DataObj", (), {"data": [{"id": "new_row"}]})()

    mock_instance = DualMockSupabase()
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock_instance)
    
    policy = PolicyInsert(drug_name="Keytruda", payer="UHC", coverage_status="covered")
    res = insert_policy(policy)
    assert res == {"id": "new_row"}

def test_insert_policy_duplicate(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "existing_row"}])
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock)
    
    policy = PolicyInsert(drug_name="Keytruda", payer="UHC")
    res = insert_policy(policy)
    # Correct duplication bypass directly returning the locally matched dictionary instance 
    assert res == {"id": "existing_row"}

def test_get_all_policies(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "1"}, {"id": "2"}])
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock)
    res = get_all_policies()
    assert len(res) == 2

def test_get_policies_by_drug(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"drug_name": "pembrolizumab"}])
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock)
    res = get_policies_by_drug("j9271")
    assert len(res) == 1
    assert res[0]["drug_name"] == "pembrolizumab"

def test_get_policy_by_payer_and_drug(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "ordered_row"}])
    monkeypatch.setattr("app.db.policies.get_supabase", lambda: mock)
    res = get_policy_by_payer_and_drug("unitedhealthcare", "Keytruda")
    assert res == {"id": "ordered_row"}
