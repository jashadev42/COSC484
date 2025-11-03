from pydantic import BaseModel
from models.moderation_status import ModerationStatusEnum 
from uuid import UUID
from typing import Optional

class PhotoMetaSchema(BaseModel):
    id: UUID
    slot: Optional[int]
    path: str
    url: str
    is_primary: bool
    size_bytes: int
    mime_type: str
    moderation_status: ModerationStatusEnum = ModerationStatusEnum.pending

class PhotoSchema(BaseModel):
    id: str
    path: str