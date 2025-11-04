from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db import get_db
from services.auth import auth_user

from models.preferences import GendersEnum
from helpers.gender import _gender_name_to_id, _get_all_gender_options, _get_profile_gender, _update_profile_gender

router = APIRouter(tags=["Profile: Gender"])

@router.get("s")
def get_all_gender_options(db: Session = Depends(get_db)):
    return _get_all_gender_options(db=db)

@router.get("/{target_uid}/gender")
def get_profile_gender(caller_uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    pass