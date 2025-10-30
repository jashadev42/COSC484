from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from routers.user import _user_exists
from models.profile import UserProfileSchema

from gender import _gender_name_to_uuid
from interest import update_user_interests

router = APIRouter(prefix="/profile", tags=["profile"])

def _profile_exists(uid: int, db: Session):
    exists = db.execute(text("SELECT 1 FROM public.profiles WHERE id = :uid LIMIT 1"), {"uid": uid}).scalar()
    return True if exists else False

"""Used the first time after a user registers, to create their dating profile"""
@router.post("/")
def create_profile(payload: UserProfileSchema, uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    payload = jsonable_encoder(payload)
    
    with db.begin() as session:
        gender_id = _gender_name_to_uuid(payload.gender, db=db)
        update_user_interests(payload=payload.interests, uid=uid)

        # Not finished with this
        stmt = text("""
            INSERT INTO public.profiles (bio, drug_use, weed_use, gender, interests, 
                    location, location_label, show_precise_location, pronouns, languages_spoken,
                    school, occupation, relationship_goal, personality_type, love_language,
                    attachment_style, political_view, zodiac_sign, religion, diet, exercise_frequency,
                    pets, smokes, drinks, sleep_schedule)
            VALUES (:bio, :drugs, :weed, :gender)
            WHERE id = :uid
        """)
        db.execute(stmt, {"uid": payload.uid})

"""Used the to update a users profile information"""
@router.put("/")
def update_profile(uid: str = Depends(auth_user), db: Session = Depends(get_db)):

    if not _profile_exists(uid, db):
        raise HTTPException(status_code=404, detail=(f"User with id '{uid}' does not exist!"))
    
    with db.begin() as session:
        pass