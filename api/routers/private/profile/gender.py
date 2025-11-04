from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db import get_db
from services.auth import auth_user

from models.preferences import GendersEnum
from helpers.gender import _gender_name_to_id, _get_all_gender_options, _get_profile_gender, _update_profile_gender

router = APIRouter(prefix="/gender", tags=["Profile: Gender"])

@router.get("")
def get_profile_gender(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _get_profile_gender(uid=uid, db=db)

@router.put("")
def update_profile_gender(gender: GendersEnum, uid = Depends(auth_user), db: Session = Depends(get_db)):
    gid = _gender_name_to_id(name=gender, db=db)
    return _update_profile_gender(gender_id=gid, uid=uid, db=db)