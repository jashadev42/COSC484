from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from sqlalchemy import text
from typing import Annotated
from helpers.user import _user_exists

router = APIRouter()

@router.get("/{target_uid}")
def get_user_info(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not _user_exists(target_uid, db=db):
        raise HTTPException(status_code=404, detail="Profile not found")

    stmt = text("""
        SELECT * FROM public.users WHERE uid = :tuid LIMIT 1
    """)
    user = db.execute(stmt, {'tuid': target_uid}).mappings().first()
    
    if not user:
        return []
    
    return user