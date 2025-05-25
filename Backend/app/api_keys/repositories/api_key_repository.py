import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import uuid4

from app.api_keys.core.config import api_key_settings

DATA_FILE: Path = api_key_settings.API_KEYS_FILE


def load_keys() -> List[Dict[str, Any]]:
    """
    Load all API keys from the configured JSON file.
    Returns an empty list if the file doesn't exist.
    """
    if not DATA_FILE.exists():
        return []
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_keys(keys: List[Dict[str, Any]]) -> None:
    """
    Save the list of API keys to the JSON file.
    """
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(keys, f, indent=4)


def generate_new_key() -> str:
    """
    Generate a new secure API key.
    """
    return f"sk_{uuid4().hex}"


def find_key_by_value(keys: List[Dict[str, Any]], key_value: str) -> Optional[Dict[str, Any]]:
    """
    Find and return the key dictionary matching a given key value.
    """
    return next((k for k in keys if k["key"] == key_value), None)


def delete_key(keys: List[Dict[str, Any]], key_value: str) -> List[Dict[str, Any]]:
    """
    Return a new list of keys excluding the one matching `key_value`.
    """
    return [k for k in keys if k["key"] != key_value]
