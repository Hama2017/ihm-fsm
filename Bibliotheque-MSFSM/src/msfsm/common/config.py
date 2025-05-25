from enum import Enum
from pydantic import BaseModel


class TargetEnum(Enum):
    ETHEREUM = "ethereum"


class Config(BaseModel):
    target: TargetEnum