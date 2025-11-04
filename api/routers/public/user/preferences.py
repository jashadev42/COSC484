from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Annotated
from helpers.profile import _profile_exists
from services.auth import auth_user
from services.db import get_db

from helpers.preferences import _update_user_prefs, _create_user_prefs, _get_user_prefs
from models.preferences import UserProfilePreferencesSchema

router = APIRouter(tags=["User: Preferences"])

# API ENDPOINTS

@router.get("/{target_uid}/preferences")
def get_user_preferences(
    target_uid: str,
    caller_uid: Annotated[str, Depends(auth_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return _get_user_prefs(uid=target_uid, db=db)