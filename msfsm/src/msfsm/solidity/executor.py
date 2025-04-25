import logging

from typing import List
from web3 import Web3
from msfsm.solidity.config import ConfigEthereum


logging.basicConfig(
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


class ExecutorSolidity:
    def __init__(
        self, contract_address: str, contract_abi: str, config: ConfigEthereum
    ):
        self.contract_address = contract_address
        self.contract_abi = contract_abi
        self.config = config

    def execute(self, function_name: str, function_args: List[str]):
        """
        Execute a function of the smart contract.
        Args:
            function_name (str): Name of the function to execute
            function_args (List[str]): Arguments for the function
        """
        function_return = None
        w3 = Web3(Web3.HTTPProvider(self.config.platform.provider_url))
        contract = w3.eth.contract(address=self.contract_address, abi=self.contract_abi)

        function_abi_outputs = contract.get_function_by_name(function_name).abi[
            "outputs"
        ]

        logger.info(
            f"Executing function {function_name} with arguments {function_args}"
        )

        if len(function_abi_outputs) < 1:  # for functions that don't return anything
            tx_hash = contract.functions[function_name](*function_args).transact()
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            function_return = True
        else:
            function_return = contract.functions[function_name](*function_args).call()

        logger.info(
            f"Function {function_name} executed with return value {function_return}"
        )

        return function_return
