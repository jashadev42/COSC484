from fastapi import HTTPException, UploadFile

import os
from sqlalchemy import text
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from models.photos import PhotoMetaSchema
from models.moderation_status import ModerationStatusEnum

from helpers.profile import _profile_exists


MAX_PHOTOS = 6 # Includes primary
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

def _create_uid_photos_folder(uid: str):
    path = f"/static{uid}/photos/"
    os.makedirs(path, exist_ok=True)

def _get_photo_path(uid: str, slot: int, ext: str = ".jpg") -> Path:
    return Path("static") / uid / "photos" / f"{slot}{ext}"

def _load_photo(uid: str, slot: int):
    for ext in [".jpg", ".jpeg", ".png", ".webp"]:
        target = _get_photo_path(uid, slot, ext)
        if target.exists():
            return target

    return None
    
def _list_photos(uid: str, db: Session):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status_code=404, detail="Profile with uid '{uid}' does not exist!")
    
    stmt = text("""
        SELECT * FROM public.profile_photos WHERE uid = :uid LIMIT 6
    """)

    res = db.execute(stmt, {"uid": uid}).scalars()
    print(res)

    return res or []

def _get_photo(slot: int, uid: str, db: Session) -> PhotoMetaSchema:
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status_code=404, detail="Profile with uid '{uid}' does not exist!")
    
    stmt = text("""
        SELECT * FROM public.profile_photos WHERE uid = :uid AND slot = :slot LIMIT 1
    """)

    res = db.execute(stmt, {"uid": uid, "slot": slot}).scalars()

    base = Path("static") / uid / "photos"
    base.mkdir(parents=True, exist_ok=True)
    
    if not _load_photo(uid=uid, slot=slot):
        raise HTTPException(status_code=404, detail=f"Photo in slot '{slot}' does not exist!")
    path = _get_photo_path(uid=uid, slot=slot)

    s = PhotoMetaSchema(slot=slot, url=str(path), is_primary=(slot==1), moderation_status=ModerationStatusEnum.approved)
    return s or None


async def _add_photo(uid: str, db: Session, photo: UploadFile):
    dest = ""
    
    suffix = Path(photo.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    base = Path("static") / uid / "photos"
    base.mkdir(parents=True, exist_ok=True)

    # Find first free slot 1..MAX_PHOTOS
    slot = None
    for s in range(1, MAX_PHOTOS + 1):
        candidate = base / f"{s}{suffix}"
        if not candidate.exists():
            slot = s
            dest = candidate
            break
    if slot is None:
        raise HTTPException(status_code=400, detail=f"There are already {MAX_PHOTOS} photos! Delete some first.")

    try:
        with dest.open("wb") as out:
            shutil.copyfileobj(photo.file, out, length=1024 * 1024)  # 1MB chunks
    finally:
        try:
            photo.file.close()
        except Exception:
            pass

    return {"ok": True, "url": dest}