from fastapi import FastAPI
from app.routes.contract import router as contract_router

app = FastAPI()

app.include_router(contract_router)