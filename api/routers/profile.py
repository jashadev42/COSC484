from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from routers.users import _user_exists

router = APIRouter(prefix="/profile", tags=["profile"])

def _profile_exists(uid: int, db: Session):
    exists = db.execute(text("SELECT 1 FROM public.profile where id = :uid LIMIT 1"), {"uid": uid}).scalar()
    return True if exists else False

"""Used the first time after a user registers, to create their dating profile"""
@router.post("/{uid}")
def create_profile(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    pass

"""Used the first time after a user registers, to set their non-changeable info (e.g. birthdate, first name, last name, etc.)"""
@router.put("/{uid}")
def set_profile_info(uid: str = Depends(auth_user), db: Session = Depends(get_db)):

    if not _profile_exists(uid, db):
        raise HTTPException(status_code=404, detail=(f"User with id '{uid}' does not exist!"))
    
    pass