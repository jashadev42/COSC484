from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Annotated
from helpers.profile import _profile_exists
from services.auth import auth_user
from services.db import get_db

from models.preferences import UserProfilePreferencesSchema

router = APIRouter(tags=["User: Preferences"])

# API ENDPOINTS

@router.get("/{target_uid}/preferences")
def get_user_preferences(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not _profile_exists(target_uid, db=db):
        raise HTTPException(status_code=404, detail="Profile not found")

    stmt = text("""
        SELECT * FROM public.user_preferences WHERE uid = :tuid LIMIT 1
    """)
    prefs = db.execute(stmt, {'tuid': target_uid}).mappings().first()
    
    if not prefs:
        return []
    
    return prefs