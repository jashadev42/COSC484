from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.auth import auth_user
from services.db import get_db

from helpers.preferences import _update_user_prefs, _create_user_prefs, _get_user_prefs
from models.preferences import UserProfilePreferencesSchema

router = APIRouter(tags=["User: Preferences"])

# API ENDPOINTS
@router.get("/{target_uid}/preferences")
def get_my_user_prefs(caller_uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    pass