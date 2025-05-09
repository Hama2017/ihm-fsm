from enum import Enum

class ContractStatus(str, Enum):
    """Contract status enumeration."""
    DRAFT = "draft"
    DEPLOYED = "deployed"