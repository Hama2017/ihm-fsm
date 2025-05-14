# app/api/routes/history.py
from typing import Dict, Any

from fastapi import APIRouter, Depends

from app.utils.history_tracker import HistoryTracker
from app.auth.api.dependencies import get_current_user
from app.auth.schemas.user import User

router = APIRouter(prefix="/history", tags=["History"])

@router.get(
    "/contract/{contract_name}",
    summary="Get history of a contract",
    response_description="Contract history events"
)
def get_contract_history(
    contract_name: str,
    user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the history of events for a contract.
    
    This endpoint requires authentication.
    """
    tracker = HistoryTracker()
    events = tracker.get_contract_history(contract_name)

    if not events:
        return {
            "contract_name": contract_name,
            "events": [],
            "message": f"No history found for contract '{contract_name}'"
        }

    return {
        "contract_name": contract_name,
        "events": events,
        "total_events": len(events)
    }