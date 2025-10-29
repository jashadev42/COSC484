import os
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv() # Load env variables

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
    raise RuntimeError("Missing DB configuration variables")

# SQLAlchemy string w/ SSL required for Supabase
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Create engine (keep default pooling)
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)

# Session generator
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

# FastAPI dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
        print("DB CONNECTED")
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()