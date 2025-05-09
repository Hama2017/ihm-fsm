from enum import Enum

class ContractStatus(str, Enum):
    DRAFT = "draft"
    DEPLOYED = "deployed"

class HistoryTrackerEventType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    DELETE_DEPLOYED = "delete_deployed"
    DEPLOY = "deploy"
    EXECUTE = "execute"

class ErrorCode(str, Enum):
    EMAIL_ALREADY_USED = "email_already_used"
    INVALID_CREDENTIALS = "invalid_credentials"
    MISSING_TOKENS = "missing_tokens"
    INVALID_TOKEN_PAYLOAD = "invalid_token_payload"
    INVALID_REFRESH_TOKEN = "invalid_refresh_token"
    MISSING_TOKEN = "missing_token"
    INVALID_TOKEN = "invalid_token"
    USER_NOT_FOUND = "user_not_found"
    INCORRECT_CURRENT_PASSWORD = "incorrect_current_password"
    PASSWORD_UPDATE_FAILED = "password_update_failed"
    REFRESH_TOKEN_EXPIRED = "REFRESH_TOKEN_EXPIRED" 
    INVALID_FILE_FORMAT = "invalid_file_format"
    FILE_TOO_LARGE = "file_too_large"
