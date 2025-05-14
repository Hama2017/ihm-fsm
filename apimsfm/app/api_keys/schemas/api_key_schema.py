from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class APIKeyBase(BaseModel):
    app_name: str = Field(..., example="My Frontend App")
    active: bool = Field(default=True)

class APIKeyCreate(APIKeyBase):
    usage_limit: Optional[int] = Field(default=None, description="Maximum number of allowed uses")

class APIKeyUpdate(BaseModel):
    app_name: Optional[str] = None
    active: Optional[bool] = None
    usage_limit: Optional[int] = None

class APIKeyOut(APIKeyBase):
    key: str = Field(..., example="sk_123456789abcdef")
    created_at: datetime = Field(..., description="Datetime when the API key was created")
    usage_count: int = Field(..., description="Number of times the API key has been used")
    usage_limit: Optional[int] = Field(default=None, description="Maximum number of allowed uses")
