from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import session, auth, gender, interest, user, profile

from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start
    yield
    # shutdown 

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(session.router)
app.include_router(auth.router)
app.include_router(gender.router)
app.include_router(interest.router)
app.include_router(user.router)
app.include_router(profile.router)

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")