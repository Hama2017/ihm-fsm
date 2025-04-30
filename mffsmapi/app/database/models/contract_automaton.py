from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

class ContractAutomaton(BaseModel):
    id: Optional[str] = None
    name: str
    status: str
    createdAt: datetime
    updatedAt: datetime
    automates: List[Automaton]
