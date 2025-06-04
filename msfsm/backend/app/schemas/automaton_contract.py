from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from app.enums.contract_status import ContractStatus
import uuid

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
    automataKey: Optional[str] = None
    automateId: Optional[str] = None
    executionStatus: Optional[str] = None

class Transition(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    markerEnd: str
    conditions: List[str] = Field(default_factory=list)
    automataDependencies: Optional[List[str]] = None

class ExecutionMetadata(BaseModel):
    completedAutomates: List[str] = Field(default_factory=list)
    contractId: Optional[str] = None
    globalStatus: str = "pending"
    lastUpdated: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class Automaton(BaseModel):
    id: str
    name: str
    active: bool
    states: List[State]
    transitions: List[Transition]
    executionMetadata: Optional[ExecutionMetadata] = None

class AutomatonContract(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    status: ContractStatus = ContractStatus.DRAFT  # Default status is draft
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    createdBy: Optional[str] = None
    description: Optional[str] = None
    automates: List[Automaton]