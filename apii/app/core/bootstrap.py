import json
from datetime import datetime, timezone
from app.auth.enums.roles import UserRole
from app.auth.repositories.user_repository import get_user_by_email, add_user
from app.auth.core.security import hash_password
from app.auth.schemas.user import User
from app.api_keys.core.config import api_key_settings
from app.auth.core.config import auth_settings

DEFAULT_ADMIN_KEY = api_key_settings.MASTER_KEY_NAME
DEFAULT_ADMIN_APP = api_key_settings.DEFAULT_ADMIN_APP
DEFAULT_ADMIN_EMAIL = auth_settings.DEFAULT_ADMIN_EMAIL
DEFAULT_ADMIN_PASSWORD = auth_settings.DEFAULT_ADMIN_PASSWORD
DEFAULT_ADMIN_FIRST_NAME = auth_settings.DEFAULT_ADMIN_FIRST_NAME
DEFAULT_ADMIN_LAST_NAME = auth_settings.DEFAULT_ADMIN_LAST_NAME


def ensure_api_key_bootstrap():
    """
    Ensure that a default admin API key exists in the system.
    Creates the JSON file if it doesn't exist, and appends the admin key if missing.
    """
    path = api_key_settings.API_KEYS_FILE
    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        path.write_text("[]", encoding="utf-8")

    try:
        keys = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        keys = []

    if not any(k['key'] == DEFAULT_ADMIN_KEY for k in keys):
        keys.append({
            "key": DEFAULT_ADMIN_KEY,
            "app_name": DEFAULT_ADMIN_APP,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "usage_count": 0,
            "usage_limit": None
        })
        path.write_text(json.dumps(keys, indent=4), encoding="utf-8")


def ensure_admin_user():
    """
    Ensure that the default admin user exists to allow first-time authentication.
    """
    auth_settings.USERS_FILE.parent.mkdir(parents=True, exist_ok=True)

    if not get_user_by_email(DEFAULT_ADMIN_EMAIL):
        admin_user = User(
            email=DEFAULT_ADMIN_EMAIL,
            firstName=DEFAULT_ADMIN_FIRST_NAME,
            lastName=DEFAULT_ADMIN_LAST_NAME,
            hashedPassword=hash_password(DEFAULT_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            profilePicture=None,
            createdAt=datetime.now(timezone.utc),
            refreshToken=None,
            refreshTokenExpiresAt=None
        )
        add_user(admin_user)


def run_bootstrap():
    """
    Run all startup routines:
    - Ensure master API key exists
    - Ensure default admin user is created
    """
    ensure_api_key_bootstrap()
    ensure_admin_user()
