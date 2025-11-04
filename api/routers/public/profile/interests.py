from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.db import get_db
from services.auth import auth_user
from models.preferences import InterestsEnum

from typing import List
from helpers.interests import _get_all_interest_options, _get_profile_interests, _delete_profile_interests, _interest_name_to_id, _interests_to_id_arr, _update_profile_interests

router = APIRouter(tags=["Profile: Interests"])

# API ENDPOINTS
@router.get("/interests")
def get_all_interest_options(db: Session = Depends(get_db)):
    return _get_all_interest_options(db=db)

@router.get("/{target_uid}/interests")
def get_profile_interests(uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    pass