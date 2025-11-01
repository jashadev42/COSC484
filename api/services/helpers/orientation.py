from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException

from services.helpers.profile import _profile_exists

def _orientation_name_to_uuid(name: str, db: Session):
    uuid = db.execute(text("SELECT id FROM public.orientations WHERE name = :name LIMIT 1"), {"name": name}).scalar()
    return uuid if uuid else None

def _get_all_orientation_options(db: Session):
    res = db.execute(text("SELECT * FROM public.orientations")).mappings().all()
    return res

def _get_profile_orientation(uid: str, db: Session):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status=404, detail=f"Profile with uid '{uid}' does not exist!")
   
    res = db.execute(text("SELECT * FROM public.orientations WHERE uid = :uid"), {"uid": uid}).mappings().all()
    return res

def _update_profile_orientation(orientation_id: str, uid: str, db: Session):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status=404, detail=f"Profile with uid '{uid}' does not exist!")
    
    stmt = text("""
        UPDATE public.profiles
        SET orientation_id = :orientation_id
        WHERE uid = :uid
    """)

    db.execute(stmt, {"orientation_id": orientation_id, "uid": uid})
    return {"ok": True}
