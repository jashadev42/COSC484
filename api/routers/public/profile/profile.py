from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user

from models.profile import UserProfileSchema

from .gender import _gender_name_to_id
from .orientation import _orientation_name_to_id
from .interests import _update_profile_interests

from helpers.profile import _profile_exists

router = APIRouter()

@router.get("/{target_uid}")
def get_my_profile(caller_uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    pass