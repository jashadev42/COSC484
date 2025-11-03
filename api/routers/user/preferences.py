from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.auth import auth_user
from services.db import get_db

from helpers.preferences import _update_user_prefs, _create_user_prefs
from models.preferences import UserProfilePreferencesSchema

router = APIRouter(prefix="/preferences", tags=["User: Preferences"])

# API ENDPOINTS

@router.put("/")
def update_user_prefs(payload: UserProfilePreferencesSchema, uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _update_user_prefs(payload=payload, uid=uid, db=db)

@router.post("/")
def create_user_prefs(payload: UserProfilePreferencesSchema, uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _create_user_prefs(payload=payload, uid=uid, db=db)
