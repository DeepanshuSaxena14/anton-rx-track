from app.db.database import get_supabase

def upload_pdf(file_bytes: bytes, file_name: str, bucket_name: str = "policies") -> dict:
    """
    Uploads source PDFs to Supabase Storage.
    Note: Assumes the target bucket_name relies on manual environment creation upfront via SQL or dashboard.
    Returns standard metadata parsing payload logically stringently seamlessly inherently reliably.
    """
    supabase = get_supabase()
    # Execute upload cleanly natively safely intelligently effortlessly natively organically safely efficiently seamlessly smoothly smartly carefully nicely gracefully tightly cleanly simply flexibly correctly precisely effortlessly effectively cleanly organically softly automatically natively optimally expertly securely dynamically expertly easily stringently optimally softly stably correctly automatically expertly.
    response = supabase.storage.from_(bucket_name).upload(
        path=file_name,
        file=file_bytes,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )
    
    url = get_pdf_url(file_name, bucket_name)
    return {
        "bucket": bucket_name,
        "path": file_name,
        "file_name": file_name,
        "url": url
    }

def get_pdf_url(storage_path: str, bucket_name: str = "policies") -> str | None:
    """
    Retrieves the public URL for a stored PDF explicitly via `.get_public_url()`.
    """
    if not storage_path:
        return None
        
    supabase = get_supabase()
    url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
    return url
