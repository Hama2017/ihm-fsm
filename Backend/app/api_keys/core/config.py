# Modification de app/api_keys/core/config.py

from pathlib import Path
from pydantic import BaseModel
import os
from dotenv import load_dotenv

class APIKeySettings(BaseModel):
    """
    Configuration for API key management.
    """
    API_KEY_HEADER_NAME: str = os.getenv("API_KEY_HEADER_NAME", "X-API-KEY")
    API_KEYS_FILE: Path = Path(os.getenv("API_KEYS_FILE", "data/api_keys/api_keys.json"))
    MASTER_KEY_NAME: str = os.getenv("MASTER_KEY_NAME", "pk_master_admin")
    DEFAULT_LABEL: str = os.getenv("DEFAULT_LABEL", "Unnamed API Key")
    DEFAULT_ADMIN_APP: str = os.getenv("DEFAULT_ADMIN_APP", "Initial Admin Key")

app_env = os.getenv("APP_ENV", "dev")
env_file = f".env.{app_env}"

if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    # Fallback to standard .env if the specific file doesn't exist
    load_dotenv()
    
api_key_settings = APIKeySettings()