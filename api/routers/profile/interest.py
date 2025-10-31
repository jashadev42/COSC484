from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from routers.user import _user_exists
from models.profile import UserProfileSchema
from models.enums.interests import InterestsEnum

from typing import List


router = APIRouter(prefix="/interest", tags=["interest"])

# PRIVATE HELPERS

def _interest_name_to_uuid(name: str, db: Session) -> str | HTTPException:
    uuid = db.execute(text("SELECT id FROM public.interests WHERE name = :name LIMIT 1"), {"name": name}).scalar()
    return uuid if uuid else HTTPException(status_code=400, detail="User interest was type 'None', that is invalid!")

def _interests_to_uuid_arr(arr: List[str], db: Session) -> List[str]:
    res: list[str] = []
    for interest in arr:
        uuid = _interest_name_to_uuid(name=interest, db=db)
        res.append(uuid)
    return res

def _update_user_interests(payload: List[InterestsEnum], uid: str, db: Session):
    payload = jsonable_encoder(payload)
    interest_ids = _interests_to_uuid_arr(payload, db=db) # List of str
    _delete_user_interests(uid=uid, db=db) # Delete existing user interests for said user

    for interest_id in interest_ids:
        stmt = text("""
            INSERT INTO public.user_interests (uid, interest_id)
            VALUES (:uid, :interest_id)
        """)
        db.execute(stmt, {"uid": uid, "interest_id": interest_id})

def _get_all_interest_names(db: Session):
    stmt = text("""
        SELECT name FROM public.interests 
    """)
    return db.execute(stmt)

# API ENDPOINTS

"""Delete all existing interests for a given user"""
def _delete_user_interests(uid: str, db: Session):
    stmt = text("""
        DELETE FROM public.user_interests
        WHERE uid = :uid
    """)
    db.execute(stmt, {"uid": uid})

"""Take in an array of user interests, and update the public.user_interests to add those. 
We delete previous interests because the payload will be the list of new interests, not just additional ones
"""
@router.post("/")
def update_user_interests(payload: List[InterestsEnum], uid: str = Depends(auth_user), db: Session = Depends(get_db), ):
     update = _update_user_interests(payload=payload, uid=uid, db=db)
     return {"updated": update}


"""Delete all existing interests for a given user"""
@router.delete("/")
def delete_user_interests(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    deleted = _delete_user_interests(uid=uid, db=db)
    return {"deleted": deleted}