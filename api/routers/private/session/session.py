from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from middleware.auth import auth_user
from models.db import get_db

from schemas.session import CreateSessionSchema

from controllers.session import _get_active_session, _create_session, _join_session, _leave_session
router = APIRouter(prefix="/me")

"""Can return the active session of a user, regardless if they are host or guest"""
@router.get("")
def get_user_session(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _get_active_session(uid=uid, db=db)

@router.delete("")
def leave_user_session(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _leave_session(uid=uid, db=db)