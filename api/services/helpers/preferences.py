from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException

from models.preferences import UserProfilePreferencesSchema
from services.helpers.user import _user_exists
from services.helpers.gender import _gender_name_to_uuid

from json import dumps

def _user_prefs_exist(uid: str, db: Session):
    if not _user_exists(uid=uid, db=db):
        raise HTTPException(status_code=404, detail=f"User with id '{uid}' does not exist!")

    stmt = text("""SELECT 1 FROM public.user_preferences WHERE uid = :uid LIMIT 1""")
    return bool(db.execute(stmt, {"uid": uid}).scalar())

def _create_user_prefs(payload: UserProfilePreferencesSchema, uid: str, db: Session):
    if _user_prefs_exist(uid=uid, db=db):
        raise HTTPException(status_code=409, detail=f"User with id '{uid}' already has preferences! Use 'PUT' to update them!")
    
    payload = jsonable_encoder(payload)
    target_gender_name = payload.get("target_gender")
    tgid = _gender_name_to_uuid(target_gender_name, db=db)

    stmt = text("""
        INSERT INTO public.user_preferences (uid, target_gender_id, age_min, age_max, max_distance, extra_options)
            VALUES (:uid, :tgid, :age_min, :age_max, :max_distance, :extra_options)
    """)

    db.execute(stmt, {"uid": uid, "tgid": tgid, "age_min": payload.get("age_min"), "age_max": payload.get("age_max"), "max_distance": payload.get("max_distance"), "extra_options": dumps(payload.get("extra_options"))})
    return {"ok": True}

def _update_user_prefs(payload: UserProfilePreferencesSchema, uid: str, db: Session):
    if not _user_prefs_exist(uid=uid, db=db):
        raise HTTPException(status=404, detail=f"The user with id '{uid}' does not have preferences created yet!")

    payload = jsonable_encoder(payload)
    target_gender_name = payload.get("target_gender")
    tgid = _gender_name_to_uuid(target_gender_name, db=db)

    stmt = text("""
        UPDATE public.user_preferences
        SET 
            target_gender_id = :tgid,
            age_min = :age_min,
            age_max = :age_max,
            max_distance = :max_distance,
            extra_options = :extra_options,
            updated_at = now()
        WHERE uid = :uid
    """)

    db.execute(stmt, {"uid": uid, "tgid": tgid, "age_min": payload.get("age_min"), "age_max": payload.get("age_max"), "max_distance": payload.get("max_distance"), "extra_options": dumps(payload.get("extra_options"))})
    return {"ok": True}