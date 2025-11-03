from pydantic import BaseModel
from models.moderation_status import ModerationStatusEnum 

class PhotoMetaSchema(BaseModel):
    slot: int
    url: str
    is_primary: bool
    moderation_status: ModerationStatusEnum

