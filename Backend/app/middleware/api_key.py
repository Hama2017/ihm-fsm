from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.exceptions import HTTPException

from app.api_keys.dependencies.api_key_checker import verify_api_key
from app.api_keys.enums.error_codes import ApiKeyErrorCode

# Define paths that should bypass API key checks (e.g., Swagger docs)
EXCLUDED_PATHS = [
    "/docs",
    "/openapi.json",
    "/redoc",
    "/assets", # Static assets 
]

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip API key verification for excluded paths
        if any(path.startswith(p) for p in EXCLUDED_PATHS):
            return await call_next(request)

        # Try to validate the API key
        try:
            verify_api_key(request)
        except HTTPException as e:
            # Convert to standardized error format if not already
            if isinstance(e.detail, str):
                code = ApiKeyErrorCode.INVALID
                if e.status_code == 401:
                    code = ApiKeyErrorCode.MISSING_HEADER
                elif e.status_code == 403 and e.detail == ApiKeyErrorCode.DISABLED:
                    code = ApiKeyErrorCode.DISABLED
                
                return JSONResponse(
                    status_code=e.status_code, 
                    content={
                        "code": code,
                        "message": str(e.detail)
                    }
                )
            return JSONResponse(status_code=e.status_code, content=e.detail)
        except Exception as e:
            return JSONResponse(
                status_code=403, 
                content={
                    "code": ApiKeyErrorCode.INVALID,
                    "message": str(e)
                }
            )

        return await call_next(request)