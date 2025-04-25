from fastapi import APIRouter
from msfsm.common.specification import SpecificationModel
from msfsm.solidity.generator import GeneratorSolidity
from msfsm.solidity.config import ConfigEthereum, EthereumPlatform


router = APIRouter(prefix="/contract", tags=["contract"])

config_ethereum_solidity = ConfigEthereum(
    target="ethereum",
    platform=EthereumPlatform(
        sol_version="0.8.0",
        provider_url="http://localhost:8545",
        chain_id=31337,
        pub_key="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        priv_key="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ),
)

@router.post(
    "/deploy",
    summary="Create, compile and deploy smart contract(s) following multi-scale finite state machine specification of a contract.",
    response_description="The deployed smart contract(s)"
)
def deploy_contract(body: SpecificationModel):
    gen = GeneratorSolidity(
        specification_obj=body,
        packages_path=["./data/p1.json", "./data/p2.json"],
        config=config_ethereum_solidity
    )

    gen.deploy()

    return gen.deployed_smart_contract_info

@router.post(
    "/execute/{contract_name}/clause/{clause_name}/function/{function_name}",
    summary="Execute a clause function of a contract.",
    response_description="Result of the execution"
)
def execute_contract(contract_name: str, clause_name: str, function_name):
    pass