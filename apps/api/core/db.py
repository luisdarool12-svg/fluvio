"""
Cliente Supabase compartido del API (service role — bypasa RLS).

Singleton a nivel proceso: crear un cliente nuevo por request reconstruye
el cliente HTTP subyacente en cada llamada. httpx.Client es thread-safe,
así que compartirlo entre los threads del pool de FastAPI es seguro.
"""
import os
from typing import Optional

from supabase import Client, create_client

_client: Optional[Client] = None


def get_db() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        )
    return _client
