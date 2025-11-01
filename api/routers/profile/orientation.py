from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user

from models.enums.orientation import SexualOrientationsEnum
from services.helpers.orientation import _get_profile_orientation, _get_all_orientation_options, _orientation_name_to_uuid, _update_profile_orientation

router = APIRouter(prefix="/orientation", tags=["Profile: Orientation"])

@router.get("/options")
def get_all_orientation_options(db: Session = Depends(get_db)):
    return _get_all_orientation_options(db=db)

@router.get("/")
def get_profile_orientation(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _get_profile_orientation(uid=uid, db=db)
    

@router.put("/")
def update_profile_orientation(gender: SexualOrientationsEnum, uid = Depends(auth_user), db: Session = Depends(get_db)):
    gid = _orientation_name_to_uuid(name=gender, db=db)
    return _update_profile_orientation(orientation_id=gid, uid=uid, db=db)