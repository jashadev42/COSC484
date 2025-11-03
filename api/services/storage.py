import io
from .supabase_client import supabase_for_user as supabase
from sqlalchemy.orm import Session
from sqlalchemy import text
from storage3 import SyncStorageClient
from fastapi import HTTPException

from models.photos import PhotoMetaSchema, PhotoSchema

import mimetypes
import uuid
from typing import Optional, Dict, Any

BUCKET = 'user_media'
BASE_PREFIX = "profile"
MAX_PHOTOS = 6

def _mime_to_ext(mime_type: str):
    ext = mimetypes.guess_extension(mime_type) or ""
    if ext == ".jpe":
        ext = ".jpg"
    return ext

def get_user_photos(storage: SyncStorageClient, uid: str, db: Session, ttl_seconds: int = 500):
    stmt = text("""
        SELECT * FROM public.profile_photos
        file_photos WHERE uid = :uid
        ORDER BY is_primary DESC, created_at DESC
    """)

    rows = db.execute(stmt, {"uid": uid}).mappings().all()
    if not rows:
        return []

    bucket = storage.from_(BUCKET)
    paths = [r["path"] for r in rows]

    signed_resp = bucket.create_signed_urls(paths, ttl_seconds)

    if isinstance(signed_resp, dict):
        data = signed_resp.get("data") or []
    elif isinstance(signed_resp, list):
        data = signed_resp
    else:
        data = []

    # Handle signedUrl vs signedURL keys
    url_map = {
        d.get("path"): (d.get("signedUrl") or d.get("signedURL"))
        for d in data if d.get("path")
    }

    return [
        PhotoMetaSchema(
            id = row["id"],
            slot = row.get("slot"),
            is_primary = row["is_primary"],
            mime_type = row.get("mime_type"),
            size_bytes = row.get("size_bytes"),
            url = url_map.get(row["path"]),
            path = row["path"]
        ) for row in rows
    ]

def upload_profile_photo(
    uid: str,
    file_bytes: bytes,
    storage: SyncStorageClient,
    mime_type: str,
    db: Session,
    slot: Optional[int] = None,
    is_primary: bool = False
) -> Dict[str, Any]:
    photo_id = uuid.uuid4()
    path = f"{BASE_PREFIX}/{uid}/photos/{photo_id}{_mime_to_ext(mime_type)}"

    bucket = storage.from_(BUCKET)

    # Literally cannot get the database to handle this with RLS idk why
    if (len(get_user_photos(storage=storage, uid=uid, db=db))+1) > MAX_PHOTOS:
        raise HTTPException(status_code=400, detail=f"There can only be a maximum of {MAX_PHOTOS} per user!")

    stmt = text("""
        INSERT INTO public.profile_photos 
            (id, uid, bucket, path, mime_type, size_bytes, is_primary, slot)
        VALUES
            (:photo_id, :uid, :bucket, :path, :mime_type, :size_bytes, :is_primary, :slot)
        RETURNING *
    """)
    row = db.execute(stmt, {"photo_id": photo_id, "uid": uid, "bucket": BUCKET, "path": path, "mime_type": mime_type, "size_bytes": len(file_bytes), "is_primary": is_primary, "slot": slot}).mappings().one()

    bucket.upload(
        path=path,
        file=file_bytes if isinstance(file_bytes, (bytes, bytearray)) else io.BytesIO(file_bytes).getvalue(),
        file_options={"content-type": mime_type, "upsert": False},
    )
    signed = bucket.create_signed_url(path, 300) or {}

    return PhotoMetaSchema (
        id = row["id"],
        slot = row.get("slot"),
        is_primary = row["is_primary"],
        mime_type = row.get("mime_type"),
        size_bytes = row.get("size_bytes"),
        path = path,
        url = signed.get("signedUrl") or signed.get("signedURL")
    )
    
def delete_profile_photo(photo: PhotoSchema, uid: str, storage: SyncStorageClient, db: Session):
    if len(get_user_photos(storage=storage, uid=uid, db=db)) == 0:
        raise HTTPException(status_code=400, detail=f"The user with uid '{uid}' has no photos uploaded!")

    stmt = text("""
        DELETE FROM public.profile_photos WHERE id = :id AND uid = :uid;
    """)

    row = db.execute(stmt, {"id": photo.id, "uid": uid})

    bucket = storage.from_(BUCKET)

    res = bucket.remove([photo.path])
    return res




    