import json
from fastapi import Request, HTTPException
from app.api_keys.enums.error_codes import ApiKeyErrorCode
from app.api_keys.core.config import api_key_settings


def load_api_keys():
    """
    Load all API keys from the JSON file.
    Returns an empty list if the file does not exist.
    """
    try:
        with open(api_key_settings.API_KEYS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save_api_keys(keys: list):
    """
    Save the updated list of API keys to the file.
    """
    with open(api_key_settings.API_KEYS_FILE, 'w') as f:
        json.dump(keys, f, indent=4)


def verify_api_key(request: Request):
    """
    FastAPI dependency to validate the incoming X-API-KEY header.

    Raises:
        401 if header is missing
        403 if key is invalid or inactive

    Returns:
        The matching API key dictionary
    """
    header_name = api_key_settings.API_KEY_HEADER_NAME
    client_key = request.headers.get(header_name)

    if not client_key:
        raise HTTPException(status_code=401, detail=ApiKeyErrorCode.MISSING_HEADER)

    keys = load_api_keys()

    for key in keys:
        if key["key"] == client_key:
            if not key.get("active", True):
                raise HTTPException(status_code=403, detail=ApiKeyErrorCode.DISABLED)
            
            # Optionally increment usage
            key["usage_count"] = key.get("usage_count", 0) + 1
            save_api_keys(keys)
            return key

    raise HTTPException(status_code=403, detail=ApiKeyErrorCode.INVALID)
