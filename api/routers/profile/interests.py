from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db import get_db
from services.auth import auth_user
from models.enums.interests import InterestsEnum

from typing import List
from services.helpers.interests import _get_all_interest_options, _get_profile_interests, _delete_profile_interests, _interest_name_to_uuid, _interests_to_uuid_arr, _update_profile_interests


router = APIRouter(prefix="/interests", tags=["Profile: Interests"])

# API ENDPOINTS
@router.get("/")
def get_profile_interests(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    _get_profile_interests(uid=uid, db=db)

@router.get("/options")
def get_all_interest_options(db: Session = Depends(get_db)):
    return _get_all_interest_options(db=db)

"""Take in an array of user interests, and update the public.user_interests to add those. 
We delete previous interests because the payload will be the list of new interests, not just additional ones
"""
@router.post("/")
def update_profile_interests(payload: List[InterestsEnum], uid: str = Depends(auth_user), db: Session = Depends(get_db), ):
     return _update_profile_interests(payload=payload, uid=uid, db=db)


"""Delete all existing interests for a given user"""
@router.delete("/")
def delete_profile_interests(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    return _delete_profile_interests(uid=uid, db=db)