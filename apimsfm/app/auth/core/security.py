import secrets
from passlib.context import CryptContext

# Setup password context with bcrypt for secure password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a password securely using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

def generate_secure_token(length: int = 64) -> str:
    """
    Generate a cryptographically secure random token.
    
    Args:
        length: Length of the token in bytes
        
    Returns:
        URL-safe base64-encoded token string
    """
    return secrets.token_urlsafe(length)