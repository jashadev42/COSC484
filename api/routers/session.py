from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db

router = APIRouter(prefix="/session", tags=["session"])

@router.get("/")
def test(db: Session = Depends(get_db)):
    now = db.execute(text("SELECT NOW()")).scalar()
    return {"server_time": now.isoformat()}