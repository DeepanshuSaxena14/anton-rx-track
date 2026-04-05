from app.db.storage import upload_pdf, get_pdf_url

def test_get_pdf_url(monkeypatch, mock_supabase_client):
    monkeypatch.setattr("app.db.storage.get_supabase", lambda: mock_supabase_client())
    url = get_pdf_url("test.pdf")
    assert url == "http://mock-url.com/test.pdf"

def test_upload_pdf(monkeypatch, mock_supabase_client):
    monkeypatch.setattr("app.db.storage.get_supabase", lambda: mock_supabase_client())
    res = upload_pdf(b"fake_pdf_bytes", "test.pdf")
    assert res["bucket"] == "policies"
    assert res["path"] == "test.pdf"
    assert res["file_name"] == "test.pdf"
    assert res["url"] == "http://mock-url.com/test.pdf"
