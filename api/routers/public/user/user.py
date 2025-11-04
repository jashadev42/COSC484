from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from models.user import UserInfoSchema

from helpers.user import _user_exists

router = APIRouter()

@router.get("/{target_uid}")
def get_user_info(caller_uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    pass