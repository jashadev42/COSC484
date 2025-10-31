import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

"""
THE PURPOSE OF THIS FILE IS TO VERIFY JWT INCOMING FROM THE USER. ALL API CALLS THAT UPDATE / INTERACT
WITH A USERS PROFILE REQUIRE US TO KNOW THAT THAT USER IS LOGGED IN & AUTHENTICATED. SO, WE NEED TO COMPARE
AND DECODE THEIR JWT AGAINST OUR "SOURCE OF TRUTH" SECRET FROM SUPABASE

THIS IS USED IN EVERY API ENDPOINT THAT INTERACTS WITH A USER PROFILE WITH THE PARAMS 'def foo(uid: str = Depends(auth_user))'
"""

from dotenv import load_dotenv, find_dotenv
load_dotenv() # Load env variables


SECRET = os.environ.get("SUPABASE_JWT_SECRET")
SCHEME = HTTPBearer(auto_error=True)

def auth_user(creds: HTTPAuthorizationCredentials = Depends(SCHEME)) -> str:
    try:
        payload = jwt.decode(creds.credentials, SECRET, algorithms=["HS256"], audience="authenticated")
        print(payload)
        sub = payload.get("sub")
        if not sub:
            raise ValueError("Missing sub")
        print("User authenticated successfully!")
        return sub # user_id (UUID)
    except (JWTError, ValueError):
        print("User failed to authenticate!")
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token")