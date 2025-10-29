import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

SECRET = os.environ("SUPABASE_JWT_SECRET")
SCHEME = HTTPBearer(auto_error=True)

def auth_user(creds: HTTPAuthorizationCredentials = Depends(SCHEME)) -> str:
    try:
        payload = jwt.decode(creds.credentials, SECRET, algorithms=["HS256"])
        sub = payload.get("sub")
        if not sub:
            raise ValueError("Missing sub")
        return sub # user_id (UUID)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token")