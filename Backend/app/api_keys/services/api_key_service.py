from typing import List
from datetime import datetime,timezone
from fastapi import HTTPException

from app.api_keys.repositories import api_key_repository as repo
from app.api_keys.schemas.api_key_schema import APIKeyCreate, APIKeyOut, APIKeyUpdate
from app.api_keys.enums.error_codes import ApiKeyErrorCode

def list_api_keys() -> List[APIKeyOut]:
    return repo.load_keys()

def create_api_key(data: APIKeyCreate) -> APIKeyOut:
    keys = repo.load_keys()
    new_key = {
        "key": repo.generate_new_key(),
        "app_name": data.app_name,
        "active": data.active,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "usage_count": 0,
        "usage_limit": data.usage_limit
    }
    keys.append(new_key)
    repo.save_keys(keys)
    return new_key

def update_api_key(key: str, updates: APIKeyUpdate) -> APIKeyOut:
    keys = repo.load_keys()
    k = repo.find_key_by_value(keys, key)
    if not k:
        raise HTTPException(status_code=404, detail=ApiKeyErrorCode.NOT_FOUND)

    if updates.app_name is not None:
        k["app_name"] = updates.app_name
    if updates.active is not None:
        k["active"] = updates.active
    if updates.usage_limit is not None:
        k["usage_limit"] = updates.usage_limit

    repo.save_keys(keys)
    return k

def delete_api_key(key: str) -> dict:
    keys = repo.load_keys()
    if not any(k["key"] == key for k in keys):
        raise HTTPException(status_code=404, detail=ApiKeyErrorCode.NOT_FOUND)
    new_keys = repo.delete_key(keys, key)
    repo.save_keys(new_keys)
    return {"detail": "Deleted"}

def disable_api_key(key: str) -> dict:
    keys = repo.load_keys()
    k = repo.find_key_by_value(keys, key)
    if not k:
        raise HTTPException(status_code=404, detail=ApiKeyErrorCode.NOT_FOUND)
    k["active"] = False
    repo.save_keys(keys)
    return {"detail": "Disabled"}
