from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.auth import auth_user
from services.db import get_db

from models.photos import PhotoMetaSchema
from typing import Annotated, List

from helpers.profile import _profile_exists


router = APIRouter(tags=["Profile: Photos"])

@router.get("/{target_uid}/photos", response_model=List[PhotoMetaSchema])
def get_user_profile_photos(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not _profile_exists(target_uid, db=db):
        raise HTTPException(status_code=404, detail="Profile not found")

    stmt = text("""
        SELECT * FROM public.profile_photos WHERE uid = :tuid
    """)
    photos = db.execute(stmt, {'tuid': target_uid}).mappings().all()
    
    if not photos:
        return []
    
    return photos