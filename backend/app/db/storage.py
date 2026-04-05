import re
from app.db.database import get_supabase

def sanitize_filename(name: str) -> str:
    """
    Cleans filenames to ensure they are safe for Supabase/S3 storage.
    Replaces spaces and non-standard characters with underscores.
    """
    # Replace anything that isn't alphanumeric, dot, dash, or underscore
    return re.sub(r'[^a-zA-Z0-9.\-_]', '_', name)

def upload_pdf(file_bytes: bytes, file_name: str, bucket_name: str = "policies") -> dict:
    """
    Uploads source PDFs to Supabase Storage with automatic sanitization.
    """
    supabase = get_supabase()
    
    # Sanitize the storage path to prevent "InvalidKey" errors
    storage_path = sanitize_filename(file_name)
    
    response = supabase.storage.from_(bucket_name).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )
    
    url = get_pdf_url(storage_path, bucket_name)
    return {
        "bucket": bucket_name,
        "path": storage_path,
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
