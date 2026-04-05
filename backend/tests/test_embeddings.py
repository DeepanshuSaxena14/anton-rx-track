from app.db.embeddings import insert_embedding, insert_embeddings, search_similar_chunks

def test_insert_embedding(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "emb1"}])
    monkeypatch.setattr("app.db.embeddings.get_supabase", lambda: mock)
    
    res = insert_embedding("pol1", 0, "text", [0.1]*384)
    assert res == {"id": "emb1"}

def test_insert_embeddings(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"id": "emb1"}, {"id": "emb2"}])
    monkeypatch.setattr("app.db.embeddings.get_supabase", lambda: mock)
    
    chunks = [{"chunk_index": 0, "chunk_text": "text1", "embedding": [0.1]*384}]
    res = insert_embeddings("pol1", chunks)
    assert len(res) == 2

def test_search_similar_chunks(monkeypatch, mock_supabase_client):
    mock = mock_supabase_client([{"policy_id": "pol1", "similarity": 0.9}])
    monkeypatch.setattr("app.db.embeddings.get_supabase", lambda: mock)
    
    res = search_similar_chunks([0.1]*384, limit=5)
    assert len(res) == 1
    assert res[0]["similarity"] == 0.9
