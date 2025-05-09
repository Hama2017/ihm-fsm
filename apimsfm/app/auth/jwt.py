from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt

from app.core.config import settings
from app.schemas.user import User


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=1)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str, ignore_exp: bool = False) -> Optional[dict]:
    try:
        options = {"verify_exp": not ignore_exp}
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM], options=options)
        return payload
    except JWTError:
        return None