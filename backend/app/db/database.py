import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_SUPABASE_URL = os.getenv("SUPABASE_URL")
_SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not _SUPABASE_URL or not _SUPABASE_KEY:
    raise ValueError(
        "Missing SUPABASE_URL or SUPABASE_KEY in environment variables."
    )

_supabase: Client = create_client(_SUPABASE_URL, _SUPABASE_KEY)


def get_supabase() -> Client:
    """
    Return the shared Supabase client for database and storage operations.
    """
    return _supabase