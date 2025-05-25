from enum import Enum

class HistoryTrackerEventType(str, Enum):
    """History tracker event type enumeration."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    DELETE_DEPLOYED = "delete_deployed"
    DEPLOY = "deploy"
    EXECUTE = "execute"