from enum import Enum

class UserRole(str, Enum):
    """
    Enum for user roles in the system.
    """
    ADMIN = "admin"
    USER = "user"
