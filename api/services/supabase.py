import os
from supabase import create_client, Client
from storage3 import SyncStorageClient as StorageClient

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

def supabase_for_user(user_jwt: str) -> Client:
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.postgrest.auth(user_jwt)
    return client

def storage_for_user(user_jwt: str) -> StorageClient:
    # Storage calls under user identity (RLS applies)
    return StorageClient(
        f"{SUPABASE_URL}/storage/v1/",
        headers={
            "Authorization": f"Bearer {user_jwt}",
            "apiKey": SUPABASE_ANON_KEY, 
        },
    )

supabase_for_service = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    