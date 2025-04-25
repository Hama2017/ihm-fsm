import json
import os
from typing import List
from fastapi import APIRouter,Body,HTTPException
from msfsm.common.specification import SpecificationModel
from msfsm.solidity.generator import GeneratorSolidity
from msfsm.solidity.executor import ExecutorSolidity
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

    os.makedirs("./data/contracts/deployed/", exist_ok=True)

    contract_data = {
        "name": body.name,
        "automatons": gen.deployed_smart_contract_info
    }

    with open(f"./data/contracts/deployed/{body.name}.json", "w") as f:
        json.dump(contract_data, f, indent=2)

    return gen.deployed_smart_contract_info

@router.post(
    "/execute/{contract_name}/clause/{clause_name}/function/{function_name}",
    summary="Execute a function from a specific automaton in the contract.",
    response_description="Result of the execution"
)
def execute_contract(
    contract_name: str,
    clause_name: str,
    function_name: str,
    args: List[str] = Body(default=[], example=["0xabc123...", 100])
):
    automate_name = clause_name
    contract_file = f"./data/contracts/deployed/{contract_name}.json"

    if not os.path.exists(contract_file):
        raise HTTPException(status_code=404, detail=f"Contract '{contract_name}' not found.")

    with open(contract_file) as f:
        contract_data = json.load(f)

    automatons = contract_data.get("automatons", {})
    if automate_name not in automatons:
        raise HTTPException(status_code=404, detail=f"Automaton '{automate_name}' not found in contract '{contract_name}'.")

    automate_info = automatons[automate_name]

    try:
        executor = ExecutorSolidity(
            contract_address=automate_info["address"],
            contract_abi=automate_info["abi"],
            config=config_ethereum_solidity
        )

        result = executor.execute(function_name=function_name, function_args=args)

        return {
            "contract": contract_name,
            "automaton": automate_name,
            "function": function_name,
            "args": args,
            "result": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
