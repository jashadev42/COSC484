from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from routers.user import _user_exists
from models.profile import UserProfileSchema

from models.enums.genders import GendersEnum

router = APIRouter(prefix="/gender", tags=["Profile: Gender"])

def _gender_name_to_uuid(name: str, db: Session):
    uuid = db.execute(text("SELECT id FROM public.genders WHERE name = :name LIMIT 1"), {"name": name}).scalar()
    return uuid if uuid else None

def _get_all_gender_options(db: Session):
    all = db.execute(text("SELECT * FROM public.genders")).mappings().all()
    return all

def _get_profile_gender(uid: str, db: Session):
    all = db.execute(text("SELECT * FROM public.genders WHERE uid = :uid"), {"uid": uid}).mappings().all()
    return all


def _update_profile_gender(gender_id: str, uid: str, db: Session):
    stmt = text("""
        UPDATE public.profiles
        SET gender_id = :gender_id
        WHERE uid = :uid
    """)

    db.execute(stmt, {"gender_id": gender_id, "uid": uid})

@router.get("/options")
def get_all_gender_options(db: Session = Depends(get_db)):
    return _get_all_gender_options(db=db)

@router.get("/")
def get_profile_gender(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    _get_profile_gender(uid=uid, db=db)

@router.put("/")
def update_profile_gender(gender: GendersEnum, uid = Depends(auth_user), db: Session = Depends(get_db)):
    gid = _gender_name_to_uuid(name=gender, db=db)
    _update_profile_gender(gender_id=gid, uid=uid, db=db)