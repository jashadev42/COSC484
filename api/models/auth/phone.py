from pydantic import BaseModel, field_validator
import re

class PhoneOTPAnswerSchema(BaseModel):
    phone: str
    code: str
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Remove any spaces, dashes, or parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', v)
        
        # Check if it matches +1 followed by 10 digits
        if not re.match(r'^\+1\d{10}$', cleaned):
            raise ValueError('Phone must be in +1XXXXXXXXXX format (e.g., +15551234567)')
        
        return cleaned