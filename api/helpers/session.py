from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

from models.user import UserInfoSchema
from models.session import SessionSchema, CreateSessionSchema
from models.session.status import SessionStatusEnum
from helpers.matchmaking import _user_in_queue, _leave_queue, _join_queue

def _user_in_session(uid: str, db: Session):
    exists = _get_active_session(uid=uid, db=db)
    return bool(exists)

def _get_all_user_sessions(uid: str, db: Session):
    stmt = text("""
        SELECT *
        FROM public.sessions
        WHERE (
            host_uid = :uid OR guest_uid = :uid
        )
    """)
    sessions = db.execute(stmt, {"uid": uid}).mappings().all()
    return sessions


def _get_active_session(uid: str, db: Session):
    stmt = text("""
        SELECT *
        FROM public.sessions
        WHERE (
            host_uid = :uid OR guest_uid = :uid
        ) AND status = 'open'
        LIMIT 1
    """)
    session = db.execute(stmt, {"uid": uid}).mappings().first()
    return session


def _create_session(payload: CreateSessionSchema, host_uid: str, db: Session):
    # Must be in queue to create session
    if not _user_in_queue(uid=host_uid, db=db):
        raise HTTPException(status_code=403, detail=f"User with uid '{host_uid}' is not in the matchmaking queue!")
    
    if _user_in_session(uid=host_uid, db=db):
        raise HTTPException(status_code=409, detail=f"User with uid '{host_uid}' is already in a session!")
    
    payload = jsonable_encoder(payload)
    mode_id = payload.get("mode_id")
    
    # Remove from queue when creating session
    _leave_queue(uid=host_uid, db=db)
    
    stmt = text("""
        INSERT INTO public.sessions (status, host_uid, mode_id)
        VALUES (:status, :host_uid, :mode_id)
        RETURNING *
    """)
    res = db.execute(stmt, {"status": SessionStatusEnum.open.value, "host_uid": host_uid, "mode_id": mode_id}).mappings().first()
    return res


def _join_session(guest_uid: str, db: Session):
    # Must be in queue to join session
    if not _user_in_queue(uid=guest_uid, db=db):
        raise HTTPException(status_code=403, detail=f"User with uid '{guest_uid}' is not in the matchmaking queue!")
    
    if _user_in_session(uid=guest_uid, db=db):
        raise HTTPException(status_code=409, detail=f"User with uid '{guest_uid}' is already in a session!")

    # TODO: Make sure the guest_uid preferences are compatible with the session host first
    stmt = text("""
        UPDATE public.sessions
        SET guest_uid = :guest_uid
        WHERE (
            closed_at IS NULL
            AND guest_uid IS NULL
            AND status = 'open'
            AND host_uid != :guest_uid
        )
        LIMIT 1
        RETURNING *
    """)
    res = db.execute(stmt, {"guest_uid": guest_uid}).mappings().first()
    
    if not res:
        raise HTTPException(status_code=404, detail="No available open session found to join")
    
    # Remove from queue after successfully joining
    _leave_queue(uid=guest_uid, db=db)
    
    return res


def _leave_session(uid: str, db: Session):
    if not _user_in_session(uid=uid, db=db):
        raise HTTPException(status_code=404, detail=f"User with uid '{uid}' is not in a session!")
    
    session = _get_active_session(uid=uid, db=db)
    
    stmt = text("""
        UPDATE public.sessions
        SET 
            status = CASE 
                -- If host is leaving and no guest, close session
                WHEN host_uid = :uid AND guest_uid IS NULL THEN 'closed'
                -- If host is leaving and there is a guest, abandon session
                WHEN host_uid = :uid AND guest_uid IS NOT NULL THEN 'abandoned'
                -- If guest is leaving, keep current status (stay open)
                ELSE status
            END,
            closed_at = CASE
                -- Set closed_at timestamp when closing or abandoning
                WHEN host_uid = :uid THEN NOW()
                ELSE closed_at
            END
        WHERE (host_uid = :uid OR guest_uid = :uid)
          AND closed_at IS NULL
          AND status = 'open'
        RETURNING *
    """)
    
    res = db.execute(stmt, {"uid": uid}).mappings().first()
    
    if not res:
        raise HTTPException(status_code=404, detail="No active session found to leave")
    
    # If host left and there was a guest (abandoned), re-queue the guest
    if res['status'] == 'abandoned' and res['guest_uid']:
        _join_queue(uid=res['guest_uid'], db=db)
    
    # If guest is leaving, set guest_uid to NULL
    if res['guest_uid'] == uid:
        clear_guest_stmt = text("""
            UPDATE public.sessions
            SET guest_uid = NULL
            WHERE id = :session_id
            RETURNING *
        """)
        res = db.execute(clear_guest_stmt, {"session_id": res['id']}).mappings().first()
    
    return res