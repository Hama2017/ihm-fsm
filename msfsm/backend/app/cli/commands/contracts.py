"""
Smart contract management commands for the MSFSM CLI.
"""
import typer
import os
from typing import List, Optional
from pathlib import Path
from app.core.config import settings
from app.cli.formatters.output import info_message, success_message, section_title, error_message

# Create contracts command group
contracts_app = typer.Typer(help="Smart contract management commands")

@contracts_app.command("list")
def list_contracts(
    status: str = typer.Option(
        None, 
        "--status", 
        "-s", 
        help="Filter by contract status (draft/deployed/all)"
    )
):
    """
    List all contracts in the system.
    
    Displays the contract name, status, and other relevant information.
    """
    section_title("Smart Contracts")
    
    # Determine which directories to check based on status
    if status == "draft" or status is None:
        draft_dir = settings.get_contract_dir(status="draft")
        if os.path.exists(draft_dir):
            draft_contracts = [f for f in os.listdir(draft_dir) if f.endswith(settings.AUTOMATON_CONTRACT_EXTENSION)]
            if draft_contracts:
                typer.echo("\nDraft Contracts:")
                for contract in draft_contracts:
                    info_message(f"{contract}")
            else:
                typer.echo("\nNo draft contracts found.")
    
    if status == "deployed" or status is None:
        deployed_dir = settings.get_contract_dir(status="deployed")
        if os.path.exists(deployed_dir):
            deployed_contracts = [f for f in os.listdir(deployed_dir) if f.endswith(settings.SMART_CONTRACT_EXTENSION)]
            if deployed_contracts:
                typer.echo("\nDeployed Contracts:")
                for contract in deployed_contracts:
                    info_message(f"{contract}")
            else:
                typer.echo("\nNo deployed contracts found.")

@contracts_app.command("clean")
def clean_contracts(
    status: str = typer.Option(
        None, 
        "--status", 
        "-s", 
        help="Contract status to clean (draft/deployed/all)"
    ),
    force: bool = typer.Option(
        False, 
        "--force", 
        "-f", 
        help="Skip confirmation prompt"
    )
):
    """
    Remove contract files.
    
    Deletes contract files from the system. Use with caution.
    """
    if status not in ["draft", "deployed", "all", None]:
        error_message(f"Invalid status: {status}. Must be 'draft', 'deployed', or 'all'.")
        raise typer.Exit(1)
    
    statuses = []
    if status == "draft" or status == "all" or status is None:
        statuses.append("draft")
    if status == "deployed" or status == "all":
        statuses.append("deployed")
    
    # Confirmation
    if not force:
        typer.echo(f"You are about to delete {'all' if len(statuses) > 1 else statuses[0]} contracts.")
        if not typer.confirm("Are you sure you want to continue?"):
            typer.secho("Operation cancelled", fg=typer.colors.YELLOW)
            raise typer.Exit()
    
    # Delete files
    for status in statuses:
        contract_dir = settings.get_contract_dir(status=status)
        if os.path.exists(contract_dir):
            extension = settings.AUTOMATON_CONTRACT_EXTENSION if status == "draft" else settings.SMART_CONTRACT_EXTENSION
            contracts = [f for f in os.listdir(contract_dir) if f.endswith(extension)]
            for contract in contracts:
                os.remove(os.path.join(contract_dir, contract))
            success_message(f"Removed {len(contracts)} {status} contracts.")
        else:
            typer.echo(f"No {status} contracts directory found.")