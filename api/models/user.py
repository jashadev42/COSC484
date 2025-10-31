from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

class UserInfoSchema(BaseModel):
    fname: str
    lname: str
    birthdate: datetime
    