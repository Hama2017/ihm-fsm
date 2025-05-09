from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from app.core.enums import ContractStatus


class Position(BaseModel):
    x: float
    y: float


class State(BaseModel):
    id: str
    label: str
    position: Position
    type: str
    sourcePosition: Optional[str] = None
    targetPosition: Optional[str] = None


class Transition(BaseModel):
    id: str
    source: str
    target: str
    label: str
    markerEnd: str
    conditions: Optional[List[str]] = []
    automataDependencies: Optional[List[str]] = None


class Automaton(BaseModel):
    id: str
    name: str
    active: bool
    states: List[State]
    transitions: List[Transition]


class AutomatonContract(BaseModel):
    id: Optional[str] = None
    name: str
    status: ContractStatus = ContractStatus.DRAFT  #Default status is draft
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    createdBy: Optional[str] = None
    description: Optional[str] = None
    automates: List[Automaton]
