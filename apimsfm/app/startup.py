from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.utils.openapi import add_api_key_security_schema
from app.core.bootstrap import run_bootstrap
from app.core.config import settings
from app.auth.core.config import auth_settings
from app.enums.error_codes import ErrorCode

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    """
    Lifespan context for FastAPI.
    Runs once at startup, handles:
    - Swagger API key schema injection
    - Directory setup
    - Default user and API key bootstrap
    """
    # Swagger X-API-KEY integration
    add_api_key_security_schema(app)

    # Configure error handlers
    setup_error_handlers(app)

    # Create required directories
    settings.setup_directories()
    auth_settings.PROFILE_PICTURES_DIR.mkdir(parents=True, exist_ok=True)
    auth_settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Ensure admin + master API key exist
    run_bootstrap()

    yield  # App is running

    # Optional: shutdown logic


def setup_error_handlers(app: FastAPI):
    """
    Set up global error handlers for the application.
    """
    # Handle validation errors
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error.get("loc", []))
            errors.append({
                "field": field,
                "type": error.get("type", "unknown_error"),
                "msg": error.get("msg", "Unknown validation error")
            })
            
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "code": ErrorCode.GENERAL_VALIDATION_FAILED,
                "message": "Validation error",
                "details": {"errors": errors}
            }
        )
    
    # Handle general exceptions
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        # For debugging, you might want to log the exception here
        
        # If the exception is already a HTTPException, we can use its status_code
        if hasattr(exc, "status_code"):
            status_code = exc.status_code
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        
        # If the exception already has a formatted detail, use it
        if hasattr(exc, "detail") and isinstance(exc.detail, dict) and "code" in exc.detail:
            return JSONResponse(
                status_code=status_code,
                content=exc.detail
            )
        
        # Otherwise, create a standard error response
        error_code = ErrorCode.GENERAL_INTERNAL_ERROR
        if status_code == 404:
            error_code = ErrorCode.GENERAL_NOT_FOUND
        elif status_code == 400:
            error_code = ErrorCode.GENERAL_BAD_REQUEST
        elif status_code == 401:
            error_code = ErrorCode.GENERAL_UNAUTHORIZED
        elif status_code == 403:
            error_code = ErrorCode.GENERAL_FORBIDDEN
        elif status_code == 409:
            error_code = ErrorCode.GENERAL_CONFLICT
            
        return JSONResponse(
            status_code=status_code,
            content={
                "code": error_code,
                "message": str(exc)
            }
        )