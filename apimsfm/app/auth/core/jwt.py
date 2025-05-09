from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import JWTError, jwt

from app.auth.core.config import auth_settings

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new JWT access token.
    
    Args:
        data: Payload data to include in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=auth_settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    return jwt.encode(
        to_encode, 
        auth_settings.JWT_SECRET_KEY, 
        algorithm=auth_settings.JWT_ALGORITHM
    )

def decode_access_token(token: str, ignore_exp: bool = False) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: The JWT token to decode
        ignore_exp: Whether to ignore token expiration
        
    Returns:
        Decoded token payload or None if token is invalid
    """
    try:
        options = {"verify_exp": not ignore_exp}
        payload = jwt.decode(
            token, 
            auth_settings.JWT_SECRET_KEY, 
            algorithms=[auth_settings.JWT_ALGORITHM], 
            options=options
        )
        return payload
    except JWTError:
        return None