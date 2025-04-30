from fastapi import FastAPI
from app.routes.contract import router as contract_router
from app.routes.package import router as package_router
from app.routes.contract_automaton import router as contract_automaton_router

app = FastAPI()

app.include_router(contract_router)
app.include_router(package_router)
app.include_router(contract_automaton_router)
