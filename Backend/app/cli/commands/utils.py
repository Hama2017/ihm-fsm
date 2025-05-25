"""
Utility commands for the MSFSM CLI.
"""
import typer
import os
import json
from pathlib import Path
from app.core.config import settings
from app.cli.formatters.output import info_message, success_message, section_title

# Create utils command group
utils_app = typer.Typer(help="Utility commands for system maintenance")

@utils_app.command("check-dirs")
def check_directories():
    """
    Check and create necessary system directories.
    
    Ensures all required data directories exist for the application to function.
    """
    section_title("System Directory Check")
    
    directories = [
        (settings.DATA_DIR, "Main data directory"),
        (settings.CONTRACTS_DIR, "Contracts directory"),
        (settings.get_contract_dir(status="draft"), "Draft contracts directory"),
        (settings.get_contract_dir(status="deployed"), "Deployed contracts directory"),
        (settings.PACKAGES_DIR, "Packages directory"),
        (settings.HISTORY_DIR, "History directory"),
        (os.path.join(settings.DATA_DIR, "users"), "Users directory"),
        (settings.PROFILE_PICTURES_DIR, "Profile pictures directory")
    ]
    
    for path, description in directories:
        if os.path.exists(path):
            info_message(f" {description} exists: {path}")
        else:
            os.makedirs(path, exist_ok=True)
            success_message(f" {description} created: {path}")
    
    typer.echo("\nAll necessary directories have been verified and created if needed.")

@utils_app.command("show-env")
def show_environment(
    detail: bool = typer.Option(
        False, 
        "--detail", 
        "-d", 
        help="Show detailed environment information"
    )
):
    """
    Display the current environment configuration.
    
    Shows the active environment and key configuration settings.
    """
    app_env = os.getenv("APP_ENV", "dev")
    env_file = f".env.{app_env}"
    
    section_title("Environment Information")
    info_message(f"Active Environment: {app_env}")
    info_message(f"Environment File: {env_file}")
    
    if detail:
        typer.echo("\nKey Configuration Settings:")
        info_message(f"API Prefix: {settings.API_PREFIX}")
        info_message(f"Ethereum Provider URL: {settings.ETHEREUM_PROVIDER_URL}")
        info_message(f"Ethereum Chain ID: {settings.ETHEREUM_CHAIN_ID}")
        info_message(f"CORS Allow Origins: {settings.CORS_ALLOW_ORIGINS}")