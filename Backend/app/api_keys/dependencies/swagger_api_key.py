from fastapi import Security
from fastapi.security.api_key import APIKeyHeader
from app.api_keys.core.config import api_key_settings

API_KEY_NAME = api_key_settings.API_KEY_HEADER_NAME

# Swagger/OpenAPI will ask for this header globally
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(x_api_key: str = Security(api_key_header)):
    """
    Swagger-only dependency to declare the X-API-KEY header in the docs.
    Does not perform validation (use middleware for real checks).
    """
    return x_api_key
