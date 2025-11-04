from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db import get_db
from services.auth import auth_user
from models.preferences import InterestsEnum

from helpers.interests import _get_all_interest_options, _get_profile_interests, _delete_profile_interests, _interest_name_to_id, _interests_to_id_arr, _update_profile_interests

from sqlalchemy import text
from typing import Annotated
from helpers.profile import _profile_exists


router = APIRouter(tags=["Profile: Interests"])

# API ENDPOINTS
@router.get("/interests")
def get_all_interest_options(db: Session = Depends(get_db)):
    return _get_all_interest_options(db=db)

@router.get("/{target_uid}/interests")
def get_user_profile_interests(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not _profile_exists(target_uid, db=db):
        raise HTTPException(status_code=404, detail="Profile not found")

    stmt = text("""
        SELECT * FROM public.user_interactions WHERE uid = :tuid
    """)
    interests = db.execute(stmt, {'tuid': target_uid}).mappings().all()
    
    if not interests:
        return []
    
    return interests