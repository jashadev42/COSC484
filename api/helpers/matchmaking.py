from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

from helpers.preferences import _get_user_prefs
from helpers.profile import _get_profile

def _get_user_queue(uid: str, db: Session):
    stmt = text("""
        SELECT *
        FROM public.matchmaking_queue
        WHERE uid = :uid
        LIMIT 1
    """)
    queue = db.execute(stmt, {"uid": uid}).mappings().first()
    if not queue:
        raise HTTPException(status_code=404, detail=f"User with uid '{uid}' is not currently in the queue!")
    
    return queue

def _user_in_queue(uid: str, db: Session):
    stmt = text("""
        SELECT *
        FROM public.matchmaking_queue
        WHERE uid = :uid
        LIMIT 1
    """)
    exists = db.execute(stmt, {"uid": uid}).mappings().first()
    return bool(exists)

def _join_queue(uid: str, db: Session):
    if _user_in_queue(uid=uid, db=db):
        raise HTTPException(status_code=409, detail=f"User with uid '{uid}' is already in the queue!")

    user_prefs = _get_user_prefs(uid=uid, db=db)
    user_profile = _get_profile(uid=uid, db=db)
    stmt = text("""
        INSERT INTO public.matchmaking_queues
            (uid, mode_id, prefs_snapshot, location_snapshot, expires_at)
        VALUES (:uid, :mode_id, :prefs_snapshot, :location_snapshot, :expires_at)
        RETURNING *
    """)
    params = {
        "uid": uid,
        "mode_id": 1, # this is temporary
        "prefs_snapshot": jsonable_encoder(user_prefs),
        "location_snapshot": jsonable_encoder(user_profile.get("location")),
        "expires_at": text("NOW() + INTERVAL '5 minutes'")
    }

    res = db.execute(stmt, params).mappings().first()
    return res

def _leave_queue(uid: str, db: Session):
    if not _user_in_queue(uid=uid, db=db):
        raise HTTPException(status_code=404, detail=f"User with uid '{uid}' is not in the queue!")
    
    stmt = text("""
        DELETE FROM public.matchmaking_queue
        WHERE uid = :uid
        RETURNING *
    """)
    res = db.execute(stmt, {"uid": uid}).mappings().first()
    
    if not res:
        raise HTTPException(status_code=404, detail="Failed to leave queue")
    
    return res