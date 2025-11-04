from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db import get_db
from services.auth import auth_user

from models.preferences import GendersEnum
from helpers.gender import _gender_name_to_id, _get_all_gender_options, _get_profile_gender, _update_profile_gender

from sqlalchemy import text
from typing import Annotated
from helpers.profile import _profile_exists

router = APIRouter(tags=["Profile: Gender"])

@router.get("/genders")
def get_all_gender_options(db: Session = Depends(get_db)):
    return _get_all_gender_options(db=db)

@router.get("/{target_uid}/gender")
def get_user_profile_gender(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not _profile_exists(target_uid, db=db):
        raise HTTPException(status_code=404, detail="Profile not found")

    stmt = text("""
        SELECT gender_id FROM public.profiles WHERE uid = :tuid
    """)
    gender_id = db.execute(stmt, {'tuid': target_uid}).scalar_one_or_none()
    
    if not gender_id:
        raise HTTPException(status_code=400, detail=f"Target user does not have a gender set!")
    
    return gender_id