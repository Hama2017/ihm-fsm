# app/auth/enums/error_codes.py
from enum import Enum

class AuthErrorCode(str, Enum):
    """
    Error codes for authentication-related operations.
    
    These codes are designed to be used with internationalization (i18n)
    in the frontend to display appropriate localized error messages.
    """
    # User errors
    EMAIL_ALREADY_USED = "auth.email_already_used"
    INVALID_CREDENTIALS = "auth.invalid_credentials"
    USER_NOT_FOUND = "auth.user_not_found"
    INCORRECT_CURRENT_PASSWORD = "auth.incorrect_current_password"
    PASSWORD_UPDATE_FAILED = "auth.password_update_failed"
    
    # Token errors
    MISSING_TOKEN = "auth.missing_token"
    INVALID_TOKEN = "auth.invalid_token"
    MISSING_TOKENS = "auth.missing_tokens"
    INVALID_TOKEN_PAYLOAD = "auth.invalid_token_payload"
    INVALID_REFRESH_TOKEN = "auth.invalid_refresh_token"
    REFRESH_TOKEN_EXPIRED = "auth.refresh_token_expired"
    
    # File errors
    INVALID_FILE_FORMAT = "auth.invalid_file_format"
    FILE_TOO_LARGE = "auth.file_too_large"
    PROFILE_PICTURE_DELETION_FAILED = "auth.profile_picture_deletion_failed"