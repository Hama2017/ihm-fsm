from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class JWTPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: EmailStr  # Subject (user email)
    firstName: str
    lastName: str
    role: str
    profilePicture: Optional[str]
    createdAt: str
    exp: Optional[int] = None  # Expiration time

class TokenPairResponse(BaseModel):
    """Schema for token pair response."""
    accessToken: str
    refreshToken: str