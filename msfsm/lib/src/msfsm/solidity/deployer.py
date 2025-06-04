import logging

from msfsm.solidity.config import ConfigEthereum
from web3 import Web3


logging.basicConfig(
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


class DeployerSolidity:
    """
    Deployer for Solidity contracts.
    Args:
        abi (str): ABI of the contract
        bytecode (str): Bytecode of the contract
        config (ConfigEthereum): Configuration object for the deployer
    """

    def __init__(
        self, contract_name: str, abi: str, bytecode: str, config: ConfigEthereum
    ):
        self.config = config
        self.contract_name = contract_name
        self.abi = abi
        self.bytecode = bytecode
        self.address = None

    def deploy(self):
        """
        Deploy the contract to the Ethereum network.
        Returns:
            str: Address of the deployed contract
        """
        w3 = Web3(Web3.HTTPProvider(self.config.platform.provider_url))

        Contract = w3.eth.contract(abi=self.abi, bytecode=self.bytecode)
        nonce = w3.eth.get_transaction_count(self.config.platform.pub_key)

        transaction = Contract.constructor().build_transaction(
            {
                "chainId": self.config.platform.chain_id,
                "gasPrice": w3.eth.gas_price,
                "from": self.config.platform.pub_key,
                "nonce": nonce,
            }
        )

        sign_transaction = w3.eth.account.sign_transaction(
            transaction, private_key=self.config.platform.priv_key
        )
        transaction_hash = w3.eth.send_raw_transaction(sign_transaction.raw_transaction)
        transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)

        self.address = transaction_receipt["contractAddress"]

        logger.info(f"Contract {self.contract_name} deployed at {self.address}")

        return self.address
