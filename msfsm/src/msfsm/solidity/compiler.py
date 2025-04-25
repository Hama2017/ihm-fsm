import logging
from msfsm.solidity.config import ConfigEthereum
from solcx import compile_standard


logging.basicConfig(
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


class CompilerSolidity:
    """
    Compiler for Solidity code.
    Args:
        contract_name (str): Name of the contract
        contract_code (str): Solidity code of the contract
        config (ConfigEthereum): Configuration object for the compiler
    """

    def __init__(
        self, contract_name: str, contract_code: str, config: ConfigEthereum
    ):
        self.contract_name = contract_name
        self.contract_code = contract_code
        self.config = config
        self.abi = None
        self.bytecode = None

    def compile(self) -> tuple[str, str]:
        """
        Compile the Solidity code and extract ABI and bytecode.
        Returns:
            tuple: ABI and bytecode of the contract
        """
        compiled_sol = compile_standard(
            {
                "language": "Solidity",
                "sources": {self.contract_name: {"content": self.contract_code}},
                "settings": {
                    "outputSelection": {
                        "*": {
                            "*": [
                                "abi",
                                "metadata",
                                "evm.bytecode",
                                "evm.bytecode.sourceMap",
                            ]  # output needed to interact with and deploy contract
                        }
                    }
                },
            },
            solc_version=self.config.platform.sol_version,
        )

        self.abi = compiled_sol["contracts"][self.contract_name][self.contract_name][
            "abi"
        ]
        self.bytecode = compiled_sol["contracts"][self.contract_name][
            self.contract_name
        ]["evm"]["bytecode"]["object"]

        logger.info(f"Contract {self.contract_name} compiled")

        return self.abi, self.bytecode
