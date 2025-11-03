from fastapi import HTTPException
from models.photos import PhotoMetaSchema
from sqlalchemy.orm import Session
from sqlalchemy import text

from helpers.profile import _profile_exists

def _list_photos(uid: str, db: Session):
    if not _profile_exists(uid=uid, db=db):
        raise HTTPException(status_code=404, detail="Profile with uid '{uid}' does not exist!")
    
    stmt = text("""
        SELECT * FROM public.profile_photos WHERE uid = :uid LIMIT 6
    """)

    res = db.execute(stmt, {"uid": uid}).scalars()
    print(res)

    return res or []
