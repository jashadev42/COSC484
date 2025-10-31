from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from routers.user import _user_exists
from routers.profile import gender, interest

from models.profile import UserProfileSchema

from routers.profile.gender import _gender_name_to_uuid
from routers.profile.interest import _update_user_interests

router = APIRouter(prefix="/profile", tags=["profile"])

router.include_router(gender.router)
router.include_router(interest.router)

def _profile_exists(uid: int, db: Session):
    exists = db.execute(text("SELECT 1 FROM public.profiles WHERE uid = :uid LIMIT 1"), {"uid": uid}).scalar()
    return True if exists else False

"""Used the first time after a user registers, to create their dating profile"""
@router.post("/")
def create_profile(payload: UserProfileSchema, uid: str = Depends(auth_user), db: Session = Depends(get_db)):
    payload = jsonable_encoder(payload)
    if(_profile_exists): return HTTPException(status_code=409, detail=f"Profile for user with uid '{uid}' is already created! Update it to make changes.")

    _update_user_interests(payload=payload.get("interests"), uid=uid, db=db)
    gender_id = _gender_name_to_uuid(name=payload.get("gender"), db=db)

    # Not finished with this
    stmt = text("""
    INSERT INTO public.profiles (
        uid,
        bio,
        drug_use,
        weed_use,
        gender_id,
        location,
        location_label,
        show_precise_location,
        pronouns,
        languages_spoken,
        school,
        occupation,
        relationship_goal,
        personality_type,
        love_language,
        attachment_style,
        political_view,
        zodiac_sign,
        religion,
        diet,
        exercise_frequency,
        pets,
        smoke_frequency,
        drink_frequency,
        sleep_schedule
    )
    VALUES (
        :uid,
        :bio,
        :drug_use,
        :weed_use,
        :gender_id,
        :location,
        :location_label,
        :show_precise_location,
        :pronouns,
        :languages_spoken,
        :school,
        :occupation,
        :relationship_goal,
        :personality_type,
        :love_language,
        :attachment_style,
        :political_view,
        :zodiac_sign,
        :religion,
        :diet,
        :exercise_frequency,
        :pets,
        :smoke_frequency,
        :drink_frequency,
        :sleep_schedule
        )
    """)

    db.execute(
        stmt,
        {
            "uid": uid,
            "bio": payload.get("bio"),
            "drug_use": payload.get("drug_use"),
            "weed_use": payload.get("weed_use"),
            "gender_id": gender_id,
            "location": payload.get("location"),
            "location_label": payload.get("location_label"),
            "show_precise_location": payload.get("show_precise_location"),
            "pronouns": payload.get("pronouns"),
            "languages_spoken": payload.get("languages_spoken"),
            "school": payload.get("school"),
            "occupation": payload.get("occupation"),
            "relationship_goal": payload.get("relationship_goal"),
            "personality_type": payload.get("personality_type"),
            "love_language": payload.get("love_language"),
            "attachment_style": payload.get("attachment_style"),
            "political_view": payload.get("political_view"),
            "zodiac_sign": payload.get("zodiac_sign"),
            "religion": payload.get("religion"),
            "diet": payload.get("diet"),
            "exercise_frequency": payload.get("exercise_frequency"),
            "pets": payload.get("pets"),
            "smoke_frequency": payload.get("smoke_frequency"),
            "drink_frequency": payload.get("drink_frequency"),
            "sleep_schedule": payload.get("sleep_schedule"),
        },
    )

"""Used to update a user's profile information"""
@router.put("/")
def update_profile(
    payload: UserProfileSchema,
    uid: str = Depends(auth_user),
    db: Session = Depends(get_db),
):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status_code=404, detail=f"User with id '{uid}' does not exist!")

    payload = jsonable_encoder(payload)
    _update_user_interests(payload=payload.get("interests"), uid=uid, db=db)
    gender_id = _gender_name_to_uuid(name=payload.get("gender"), db=db)

    stmt = text("""
        UPDATE public.profiles
        SET
            bio = :bio,
            drug_use = :drug_use,
            weed_use = :weed_use,
            gender_id = :gender_id,
            location = :location,
            location_label = :location_label,
            show_precise_location = :show_precise_location,
            pronouns = :pronouns,
            languages_spoken = :languages_spoken,
            school = :school,
            occupation = :occupation,
            relationship_goal = :relationship_goal,
            personality_type = :personality_type,
            love_language = :love_language,
            attachment_style = :attachment_style,
            political_view = :political_view,
            zodiac_sign = :zodiac_sign,
            religion = :religion,
            diet = :diet,
            exercise_frequency = :exercise_frequency,
            pets = :pets,
            smoke_frequency = :smoke_frequency,
            drink_frequency = :drink_frequency,
            sleep_schedule = :sleep_schedule,
            updated_at = now()
        WHERE uid = :uid
    """)

    db.execute(
        stmt,
        {
            "uid": uid,
            "bio": payload.get("bio"),
            "drug_use": payload.get("drug_use"),
            "weed_use": payload.get("weed_use"),
            "gender_id": gender_id,
            "location": payload.get("location"),
            "location_label": payload.get("location_label"),
            "show_precise_location": payload.get("show_precise_location"),
            "pronouns": payload.get("pronouns"),
            "languages_spoken": payload.get("languages_spoken"),
            "school": payload.get("school"),
            "occupation": payload.get("occupation"),
            "relationship_goal": payload.get("relationship_goal"),
            "personality_type": payload.get("personality_type"),
            "love_language": payload.get("love_language"),
            "attachment_style": payload.get("attachment_style"),
            "political_view": payload.get("political_view"),
            "zodiac_sign": payload.get("zodiac_sign"),
            "religion": payload.get("religion"),
            "diet": payload.get("diet"),
            "exercise_frequency": payload.get("exercise_frequency"),
            "pets": payload.get("pets"),
            "smoke_frequency": payload.get("smoke_frequency"),
            "drink_frequency": payload.get("drink_frequency"),
            "sleep_schedule": payload.get("sleep_schedule"),
        },
    )

    return {"status": "success", "message": f"Profile for user '{uid}' updated."}
