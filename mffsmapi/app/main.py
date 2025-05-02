from fastapi import FastAPI
from app.api.routes.contract import router as contract_router
from app.api.routes.package import router as package_router
from app.api.routes.contract_automaton import router as contract_automaton_router
from app.core.config import settings

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    summary=settings.API_SUMMARY,
    version=settings.API_VERSION)

app.include_router(contract_router)
app.include_router(package_router)
app.include_router(contract_automaton_router)
