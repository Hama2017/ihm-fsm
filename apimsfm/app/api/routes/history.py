from typing import Dict, Any

from fastapi import APIRouter

from app.utils.history_tracker import HistoryTracker

router = APIRouter(prefix="/history", tags=["History"])


@router.get(
    "/contract/{contract_name}",
    summary="Get history of a contract",
    response_description="Contract history events"
)
def get_contract_history(contract_name: str) -> Dict[str, Any]:
    """
    Get the history of events for a contract.
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