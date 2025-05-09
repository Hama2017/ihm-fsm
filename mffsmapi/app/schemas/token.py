from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class JWTPayload(BaseModel):
    sub: EmailStr
    firstName: str
    lastName: str
    role: str
    profilePicture: Optional[str]
    createdAt: str
    exp: Optional[int] = None 
