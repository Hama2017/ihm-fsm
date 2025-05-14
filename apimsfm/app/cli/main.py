"""
Main entry point for the MSFSM CLI.
"""
import typer
import os
from typing import Optional
from pathlib import Path

# Import command groups
from app.cli.commands.admin import admin_app
from app.cli.commands.contracts import contracts_app
from app.cli.commands.utils import utils_app

# Create main app
app = typer.Typer(
    help="MSFSM API Management CLI - Manage your multi-scale finite state machine API"
)

# Add command groups to the main app
app.add_typer(admin_app, name="admin")
app.add_typer(contracts_app, name="contract")
app.add_typer(utils_app, name="utils")

@app.callback(invoke_without_command=True)
def main(ctx: typer.Context):
    """
    Multi-Scale Finite State Machine API Management CLI.
    
    This tool helps you manage your MSFSM API system, including admin users,
    API keys, smart contracts, and other administrative tasks.
    """
    # Only show the welcome message if no subcommand is provided
    if ctx.invoked_subcommand is None:
        typer.secho("""
╔══════════════════════════════════════════════╗
║   WELCOME TO THE SMART LEGAL CONTRACT CLI    ║
╚══════════════════════════════════════════════╝
        """, fg=typer.colors.CYAN, bold=True)
        
        typer.echo("Available command groups:\n")
        typer.echo("  admin     Admin user and API key management commands")
        typer.echo("  contract  Smart contract management commands")
        typer.echo("  utils     Utility commands for system maintenance")
        
        typer.echo("\nRun a command with --help to see available options.")
        typer.echo("For example: msfsm-cli admin --help")

if __name__ == "__main__":
    app()