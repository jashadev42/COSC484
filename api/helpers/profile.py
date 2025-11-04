from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException

from helpers.user import _user_exists

def _profile_exists(uid: str, db: Session) -> bool:
    if not _user_exists(uid=uid, db=db):
        raise HTTPException(status_code=404, detail=f"User with id '{uid}' does not exist!")
    
    return bool(
        db.execute(
            text("""SELECT 1 FROM public.profiles WHERE uid = :uid LIMIT 1"""),
            {"uid": uid}
        ).scalar()
    )