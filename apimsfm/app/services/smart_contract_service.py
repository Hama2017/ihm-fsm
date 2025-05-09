from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from msfsm.common.specification import SpecificationModel
from msfsm.solidity.generator import GeneratorSolidity
from msfsm.solidity.executor import ExecutorSolidity

from app.core.config import settings
from app.core.exceptions import (
    SmartContractNotFoundException,
    AutomatonNotFoundException,
    ContractDeploymentException,
    ContractExecutionException
)
from app.repositories.smart_contract_repository import SmartContractRepository
from app.schemas.smart_contract import ExecutionResult
from app.utils.history_tracker import HistoryTracker
from app.core.enums import HistoryTrackerEventType


class SmartContractService:
    """Service for managing deployed smart contracts."""

    def __init__(self, repository: SmartContractRepository):
        self.repository = repository
        self.ethereum_config = settings.ethereum_config
        self.history_tracker = HistoryTracker()

    def deploy_contract(self, specification: SpecificationModel, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Deploy a contract based on a specification."""
        try:
            generator = GeneratorSolidity(
                specification_obj=specification,
                packages_path=settings.DEFAULT_PACKAGES_PATHS,
                config=self.ethereum_config
            )

            generator.deploy()
            deployment_time = datetime.now(timezone.utc)

            contract_data = {
                "name": specification.name,
                "deployed_at": deployment_time.isoformat(),
                "deployed_by": user_id,
                "source_contract": f"{specification.name}.slac",
                "automatons": generator.deployed_smart_contract_info
            }

            self.repository.save(specification.name, contract_data)

            self.history_tracker.record_event(
                contract_name=specification.name,
                event_type=HistoryTrackerEventType.DEPLOY,
                user_id=user_id,
                details={"automatons_count": len(specification.automatons)}
            )

            return contract_data

        except Exception as e:
            raise ContractDeploymentException(str(e))

    def get_deployed_contract(self, contract_name: str) -> Dict[str, Any]:
        return self.repository.get_by_name(contract_name)

    def get_all_deployed_contracts(self) -> List[Dict[str, Any]]:
        return self.repository.get_all()

    def delete_deployed_contract(self, contract_name: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        self.repository.delete(contract_name)

        self.history_tracker.record_event(
            contract_name=contract_name,
            event_type=HistoryTrackerEventType.DELETE_DEPLOYED,
            user_id=user_id
        )

        return {
            "message": f"Deployed contract {contract_name} deleted successfully.",
            "filename": f"{contract_name}{settings.SMART_CONTRACT_EXTENSION}"
        }

    def execute_contract_function(
        self,
        contract_name: str,
        automaton_name: str,
        function_name: str,
        args: List[str],
        user_id: Optional[str] = None
    ) -> ExecutionResult:
        try:
            contract_data = self.get_deployed_contract(contract_name)
            automatons = contract_data.get("automatons", {})

            if automaton_name not in automatons:
                raise AutomatonNotFoundException(automaton_name, contract_name)

            automaton_info = automatons[automaton_name]

            executor = ExecutorSolidity(
                contract_address=automaton_info["address"],
                contract_abi=automaton_info["abi"],
                config=self.ethereum_config
            )

            result = executor.execute(function_name=function_name, function_args=args)

            self.history_tracker.record_event(
                contract_name=contract_name,
                event_type=HistoryTrackerEventType.EXECUTE,
                user_id=user_id,
                details={
                    "automaton": automaton_name,
                    "function": function_name,
                    "args": args,
                    "result": str(result)
                }
            )

            return ExecutionResult(
                contract=contract_name,
                automaton=automaton_name,
                function=function_name,
                args=args,
                timestamp=datetime.now(timezone.utc),
                result=result
            )

        except (SmartContractNotFoundException, AutomatonNotFoundException):
            raise
        except Exception as e:
            raise ContractExecutionException(str(e))
