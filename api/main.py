from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import sessions

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

app.include_router(sessions.router)

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")