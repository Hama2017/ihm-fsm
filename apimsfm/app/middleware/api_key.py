from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.exceptions import HTTPException

from app.api_keys.dependencies.api_key_checker import verify_api_key

# Define paths that should bypass API key checks (e.g., Swagger docs)
EXCLUDED_PATHS = [
    "/docs",
    "/openapi.json",
    "/redoc"
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
            return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
        except Exception as e:
            return JSONResponse(status_code=403, content={"detail": str(e)})

        return await call_next(request)
