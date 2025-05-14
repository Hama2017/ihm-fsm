from pathlib import Path
from pydantic import BaseModel

class APIKeySettings(BaseModel):
    """
    Configuration for API key management.
    """
    API_KEY_HEADER_NAME: str = "X-API-KEY"
    API_KEYS_FILE: Path = Path("data/api_keys.json")
    API_KEYS_BACKUP_DIR: Path = Path("data/api_keys/backups")
    MASTER_KEY_NAME: str = "sk_master_admin"
    DEFAULT_LABEL: str = "Unnamed API Key"
    DEFAULT_ADMIN_APP: str = "Initial Admin Key"
 
api_key_settings = APIKeySettings()
