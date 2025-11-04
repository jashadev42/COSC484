from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from typing import Annotated
from helpers.profile import _profile_exists

from models.preferences.orientation import SexualOrientationsEnum 
from helpers.orientation import _get_profile_orientation, _get_all_orientation_options, _orientation_name_to_id, _update_profile_orientation

router = APIRouter(tags=["Profile: Orientation"])

@router.get("/orientations")
def get_all_orientation_options(db: Session = Depends(get_db)):
    return _get_all_orientation_options(db=db)

@router.get("/{target_uid}/orientation")
def get_user_profile_orientation(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not _profile_exists(target_uid, db=db):
        raise HTTPException(status_code=404, detail="Profile not found")

    stmt = text("""
        SELECT orientation_id FROM public.profiles WHERE uid = :tuid LIMIT 1
    """)
    orientation_id = db.execute(stmt, {'tuid': target_uid}).scalar_one_or_none()
    
    if not orientation_id:
        raise HTTPException(status_code=400, detail=f"Target user does not have an orientation set!")
    
    return orientation_id