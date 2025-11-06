from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

import json
from datetime import datetime, timedelta

from helpers.preferences import _get_user_prefs
from helpers.profile import _get_profile

def _get_queue(uid: str, db: Session):
    print("HERE")
    stmt = text("""
        SELECT *
        FROM sessions.matchmaking_queue
        WHERE uid = :uid
        LIMIT 1
    """)
    queue = db.execute(stmt, {"uid": uid}).mappings().first()
    print("QUEUE:", queue)
    if not queue:
        raise HTTPException(status_code=404, detail=f"User with uid '{uid}' is not currently in the queue!")
    
    return queue

def _user_in_queue(uid: str, db: Session):
    stmt = text("""
        SELECT *
        FROM sessions.matchmaking_queue
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
        INSERT INTO sessions.matchmaking_queue
            (uid, prefs_snapshot, location_snapshot, expires_at)
        VALUES (:uid, CAST(:prefs_snapshot AS jsonb), CAST(:location_snapshot AS jsonb), :expires_at)
        RETURNING *
    """)
    
    # Calculate expiry time (e.g., 10 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    params = {
        "uid": uid,
        "prefs_snapshot": json.dumps(jsonable_encoder(user_prefs)),  # Convert dict to JSON string
        "location_snapshot": json.dumps(jsonable_encoder(user_profile.get("location"))),  # Convert to JSON string
        "expires_at": expires_at  # Proper datetime object
    }
    
    res = db.execute(stmt, params).mappings().first()
    return res

def _leave_queue(uid: str, db: Session):
    if not _user_in_queue(uid=uid, db=db):
        raise HTTPException(status_code=404, detail=f"User with uid '{uid}' is not in the queue!")
    
    stmt = text("""
        DELETE FROM sessions.matchmaking_queue
        WHERE uid = :uid
        RETURNING *
    """)
    res = db.execute(stmt, {"uid": uid}).mappings().first()
    
    if not res:
        raise HTTPException(status_code=404, detail="Failed to leave queue")
    
    return res