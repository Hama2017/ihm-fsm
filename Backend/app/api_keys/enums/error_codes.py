from enum import Enum


class ApiKeyErrorCode(str, Enum):
    NOT_FOUND = "API_KEY_NOT_FOUND"
    ALREADY_EXISTS = "API_KEY_ALREADY_EXISTS"
    INVALID = "INVALID_API_KEY"
    UNAUTHORIZED = "UNAUTHORIZED_ACCESS"
    MISSING_HEADER = "API_KEY_HEADER_MISSING"
    DISABLED = "API_KEY_DISABLED"
