
import json
import os
from typing import Dict, List, Any

from msfsm.common.specification import SpecificationModel
from msfsm.solidity.generator import GeneratorSolidity
from msfsm.solidity.executor import ExecutorSolidity

from app.core.config import settings
from app.core.exceptions import (
    ContractNotFoundException, 
    AutomatonNotFoundException, 
    ContractDeploymentException,
    ContractExecutionException
)
from app.repositories.smart_contract_repository import DeployedContractRepository
from app.schemas.smart_contract import ExecutionResult

class ContractService:
    """Service for managing deployed contracts."""
    
    def __init__(self, repository: DeployedContractRepository):
        """
        Initialize the ContractService.
        
        Args:
            repository (DeployedContractRepository): Repository for deployed contracts
        """
        self.repository = repository
        self.ethereum_config = settings.ethereum_config
        
    def deploy_contract(self, specification: SpecificationModel) -> Dict[str, Any]:
        """
        Deploy a contract based on a specification.
        
        Args:
            specification (SpecificationModel): Contract specification
            
        Returns:
            Dict[str, Any]: Deployed contract information
            
        Raises:
            ContractDeploymentException: If deployment fails
        """
        try:
            # Initialize generator with the specification
            generator = GeneratorSolidity(
                specification_obj=specification,
                packages_path=settings.DEFAULT_PACKAGES_PATHS,
                config=self.ethereum_config
            )
            
            # Deploy the contract
            generator.deploy()
            
            # Save contract info
            contract_data = {
                "name": specification.name,
                "status": "deployed",
                "automatons": generator.deployed_smart_contract_info
            }
            
            # Save the contract data
            self.repository.save(specification.name, contract_data)
            
            return generator.deployed_smart_contract_info
            
        except Exception as e:
            raise ContractDeploymentException(str(e))
    
    def get_deployed_contract(self, contract_name: str) -> Dict[str, Any]:
        """
        Get information about a deployed contract.
        
        Args:
            contract_name (str): Contract name
            
        Returns:
            Dict[str, Any]: Contract information
            
        Raises:
            ContractNotFoundException: If contract not found
        """
        return self.repository.get_by_name(contract_name)
    
    def get_all_deployed_contracts(self) -> List[Dict[str, Any]]:
        """
        Get all deployed contracts.
        
        Returns:
            List[Dict[str, Any]]: List of all deployed contracts
        """
        return self.repository.get_all()
    
    def execute_contract_function(
        self, 
        contract_name: str, 
        automaton_name: str, 
        function_name: str, 
        args: List[str]
    ) -> ExecutionResult:
        """
        Execute a function on a deployed contract automaton.
        
        Args:
            contract_name (str): Contract name
            automaton_name (str): Automaton name
            function_name (str): Function name
            args (List[str]): Function arguments
            
        Returns:
            ExecutionResult: Execution result
            
        Raises:
            ContractNotFoundException: If contract not found
            AutomatonNotFoundException: If automaton not found
            ContractExecutionException: If function execution fails
        """
        try:
            contract_data = self.get_deployed_contract(contract_name)
            
            automatons = contract_data.get("automatons", {})
            if automaton_name not in automatons:
                raise AutomatonNotFoundException(automaton_name, contract_name)
            
            automaton_info = automatons[automaton_name]
            
            # Create executor
            executor = ExecutorSolidity(
                contract_address=automaton_info["address"],
                contract_abi=automaton_info["abi"],
                config=self.ethereum_config
            )
            
            # Execute function
            result = executor.execute(function_name=function_name, function_args=args)
            
            return ExecutionResult(
                contract=contract_name,
                automaton=automaton_name,
                function=function_name,
                args=args,
                result=result
            )
        
        except (ContractNotFoundException, AutomatonNotFoundException):
            raise
        except Exception as e:
            raise ContractExecutionException(str(e))