from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user

from typing import Annotated

router = APIRouter()

@router.get("/{target_uid}")
def get_user_profile(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    stmt = text("""
        SELECT * FROM public.profiles WHERE uid = :tuid LIMIT 1
    """)
    profile = db.execute(stmt, {'tuid': target_uid}).mappings().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile