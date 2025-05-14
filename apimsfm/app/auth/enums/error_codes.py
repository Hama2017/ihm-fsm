# app/auth/enums/error_codes.py
from enum import Enum

class AuthErrorCode(str, Enum):
    """
    Error codes for authentication-related operations.
    
    These codes are designed to be used with internationalization (i18n)
    in the frontend to display appropriate localized error messages.
    """
    # User errors
    EMAIL_ALREADY_USED = "auth_email_already_used"
    INVALID_CREDENTIALS = "auth_invalid_credentials"
    USER_NOT_FOUND = "auth_user_not_found"
    INCORRECT_CURRENT_PASSWORD = "auth_incorrect_current_password"
    PASSWORD_UPDATE_FAILED = "auth_password_update_failed"
    
    # Token errors
    MISSING_TOKEN = "auth_missing_token"
    INVALID_TOKEN = "auth_invalid_token"
    MISSING_TOKENS = "auth_missing_tokens"
    INVALID_TOKEN_PAYLOAD = "auth_invalid_token_payload"
    INVALID_REFRESH_TOKEN = "auth_invalid_refresh_token"
    REFRESH_TOKEN_EXPIRED = "auth_refresh_token_expired"
    
    # File errors
    INVALID_FILE_FORMAT = "auth_invalid_file_format"
    FILE_TOO_LARGE = "auth_file_too_large"
    PROFILE_PICTURE_DELETION_FAILED = "auth_profile_picture_deletion_failed"