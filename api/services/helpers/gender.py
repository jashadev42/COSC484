from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException

from services.helpers.profile import _profile_exists

def _gender_name_to_uuid(name: str, db: Session):
    uuid = db.execute(text("SELECT id FROM public.genders WHERE name = :name LIMIT 1"), {"name": name}).scalar()
    if uuid:
        return uuid
    else:
        raise HTTPException(status_code=400, detail=f"Gender '{name}' is not registered in the database!")
    

def _get_all_gender_options(db: Session):
    res = db.execute(text("SELECT * FROM public.genders")).mappings().all()
    return res

def _get_profile_gender(uid: str, db: Session):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status=404, detail=f"Profile with id '{uid}' does not exist!")
    
    res = db.execute(text("SELECT * FROM public.genders WHERE uid = :uid"), {"uid": uid}).mappings().all()
    return res


def _update_profile_gender(gender_id: str, uid: str, db: Session):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status=404, detail=f"Profile with id '{uid}' does not exist!")

    stmt = text("""
        UPDATE public.profiles
        SET gender_id = :gender_id
        WHERE uid = :uid
    """)

    db.execute(stmt, {"gender_id": gender_id, "uid": uid})
    return {"ok": True}