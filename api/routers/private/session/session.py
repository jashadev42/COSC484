from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.auth import auth_user
from services.db import get_db

from models.session import CreateSessionSchema

from helpers.session import _get_active_session, _create_session, _join_session, _leave_session
router = APIRouter()

"""Can return the active session of a user, regardless if they are host or guest"""
@router.get("/{uid}")
def get_user_session(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _get_active_session(uid=uid, db=db)

@router.delete("/{uid}")
def leave_user_session(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _leave_session(uid=uid, db=db)