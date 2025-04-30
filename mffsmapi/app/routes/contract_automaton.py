import os
import json
import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.database.models.contract_automaton import ContractAutomaton

router = APIRouter(
    prefix="/contract-automaton",
    tags=["Contract Automaton"]
)

DATA_FOLDER = "data/contracts/editable/slca/"
os.makedirs(DATA_FOLDER, exist_ok=True)

def sanitize_name(name: str) -> str:
    name = name.strip()
    name = re.sub(r'[^\w\-]', '_', name)  # Remplacer caractères non alphanumériques par _
    return name

@router.get("/")
def list_contracts():
    try:
        files = os.listdir(DATA_FOLDER)
        contracts = []
        for filename in files:
            if filename.endswith(".slc"):
                filepath = os.path.join(DATA_FOLDER, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    contract_data = json.load(f)
                    contracts.append(contract_data)
        return {"contracts": contracts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_contract(contract: ContractAutomaton):
    
    contract.status='deployer'
    
    if not contract.name:
        raise HTTPException(status_code=400, detail="Name is required.")

    sanitized_name = sanitize_name(contract.name)

    filepath = os.path.join(DATA_FOLDER, f"{sanitized_name}.slc")

    if os.path.exists(filepath):
        raise HTTPException(status_code=409, detail="A contract with this name already exists.")

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(contract.dict(), f, indent=2, default=str)

    return {
        "message": "Contract SLCA created successfully.",
        "filename": f"{sanitized_name}.slc",
        "contractName": sanitized_name
    }

@router.get("/{contract_name}")
def get_contract(contract_name: str):
    sanitized_name = sanitize_name(contract_name)
    filepath = os.path.join(DATA_FOLDER, f"{sanitized_name}.slc")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found.")

    with open(filepath, "r", encoding="utf-8") as f:
        content = json.load(f)

    return JSONResponse(content=content)

@router.put("/{contract_name}")
def update_contract(contract_name: str, contract: ContractAutomaton):
    sanitized_name = sanitize_name(contract_name)
    filepath = os.path.join(DATA_FOLDER, f"{sanitized_name}.slc")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found.")

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(contract.dict(), f, indent=2, default=str)

    return {"message": "Contract SLCA updated successfully.", "filename": f"{sanitized_name}.slc"}

@router.delete("/{contract_name}")
def delete_contract(contract_name: str):
    sanitized_name = sanitize_name(contract_name)
    filepath = os.path.join(DATA_FOLDER, f"{sanitized_name}.slc")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found.")

    os.remove(filepath)
    return {"message": "Contract SLCA deleted successfully.", "filename": f"{sanitized_name}.slc"}
