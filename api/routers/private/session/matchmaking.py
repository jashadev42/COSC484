from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.auth import auth_user
from services.db import get_db

from models.session import CreateSessionSchema

from helpers.matchmaking import _get_queue, _join_queue, _leave_queue

router = APIRouter(prefix="/me/queue")

@router.get("")
def get_user_queue(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _get_queue(uid=uid, db=db)

@router.post("")
def enqueue(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _join_queue(uid=uid, db=db)

@router.delete("")
def dequeue(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _leave_queue(uid=uid, db=db)


# open → closed (host leaves, no guest)
# open → abandoned (host leaves with guest) → guest re-queued
# open → open (guest leaves) → guest_uid cleared