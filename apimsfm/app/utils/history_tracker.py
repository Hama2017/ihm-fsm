import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.core.config import settings


class HistoryTracker:
    """Utility for tracking contract history."""

    def __init__(self):
        """Initialize the history tracker."""
        self.history_dir = settings.HISTORY_DIR
        os.makedirs(self.history_dir, exist_ok=True)

    def _get_contract_history_path(self, contract_name: str) -> str:
        """Get the path to the contract history file."""
        return os.path.join(self.history_dir, f"{contract_name}_history.json")

    def record_event(
            self,
            contract_name: str,
            event_type: str,
            user_id: Optional[str] = None,
            details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Record a contract event in the history.

        Args:
            contract_name: Name of the contract
            event_type: Type of event (create, update, deploy, etc.)
            user_id: ID of the user who performed the action
            details: Additional event details

        Returns:
            Dict[str, Any]: The recorded event
        """
        # Create event data
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "contract_name": contract_name,
            "event_type": event_type,
            "user_id": user_id,
            "details": details or {}
        }

        # Get history file path
        history_path = self._get_contract_history_path(contract_name)

        # Load existing history or create new
        if os.path.exists(history_path):
            try:
                with open(history_path, 'r') as f:
                    history = json.load(f)
            except:
                history = {"events": []}
        else:
            history = {"events": []}

        # Add new event
        history["events"].append(event)

        # Save updated history
        with open(history_path, 'w') as f:
            json.dump(history, f, indent=2)

        return event

    def get_contract_history(self, contract_name: str) -> List[Dict[str, Any]]:
        """
        Get the history of events for a contract.

        Args:
            contract_name: Name of the contract

        Returns:
            List[Dict[str, Any]]: List of events for the contract
        """
        history_path = self._get_contract_history_path(contract_name)

        if not os.path.exists(history_path):
            return []

        try:
            with open(history_path, 'r') as f:
                history = json.load(f)
            return history.get("events", [])
        except:
            return []