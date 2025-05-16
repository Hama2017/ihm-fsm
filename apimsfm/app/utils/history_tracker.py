import json
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.core.config import settings


class HistoryTracker:
    """Utility for tracking contract history."""

    def __init__(self):
        """Initialize the history tracker."""
        self.history_dir = settings.HISTORY_DIR
        os.makedirs(self.history_dir, exist_ok=True)

    def _get_contract_history_path(self, contract_id: str) -> str:
        """Return the path to the contract's history file."""
        return os.path.join(self.history_dir, f"{contract_id}_history.json")

    def record_event(
            self,
            contract_id: str,
            event_type: str,
            user_id: Optional[str] = None,
            details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Record an event in the contract's history.

        Args:
            contract_id: Unique identifier of the contract
            event_type: Type of event (e.g., create, update, deploy)
            user_id: ID of the user who performed the action
            details: Additional metadata for the event

        Returns:
            Dict[str, Any]: The newly recorded event
        """
        # Create the event entry
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "contract_id": contract_id,
            "event_type": event_type,
            "user_id": user_id,
            "details": details or {}
        }

        # Determine file path
        history_path = self._get_contract_history_path(contract_id)

        # Load existing history, or initialize new one
        if os.path.exists(history_path):
            try:
                with open(history_path, 'r') as f:
                    history = json.load(f)
            except:
                history = {"events": []}
        else:
            history = {"events": []}

        # Append the new event
        history["events"].append(event)

        # Save the updated history to file
        with open(history_path, 'w') as f:
            json.dump(history, f, indent=2)

        return event

    def get_contract_history(self, contract_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve the event history of a specific contract.

        Args:
            contract_id: Unique identifier of the contract

        Returns:
            List[Dict[str, Any]]: List of recorded events
        """
        history_path = self._get_contract_history_path(contract_id)

        if not os.path.exists(history_path):
            return []

        try:
            with open(history_path, 'r') as f:
                history = json.load(f)
            return history.get("events", [])
        except:
            return []
