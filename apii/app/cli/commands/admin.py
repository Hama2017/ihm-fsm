"""
Admin management commands for the MSFSM CLI.
"""
import typer
from typing import Optional
from app.core.bootstrap import ensure_admin_user, ensure_api_key_bootstrap
from app.auth.core.config import auth_settings
from app.api_keys.core.config import api_key_settings
from app.cli.formatters.output import info_message, success_message, section_title

# Create admin command group
admin_app = typer.Typer(help="Admin user and API key management commands")

@admin_app.command("reset")
def reset_admin(
    force: bool = typer.Option(
        False, 
        "--force", 
        "-f", 
        help="Skip confirmation prompt"
    )
):
    """
    Reset the default admin user and API key.
    
    This command resets the admin user and the master API key to their default values.
    Use this command during setup or when you need to regain access to the system.
    """
    # Show current default values
    section_title("Current defaults")
    info_message(f"Admin Email: {auth_settings.DEFAULT_ADMIN_EMAIL}")
    info_message(f"Master API Key: {api_key_settings.MASTER_KEY_NAME}")
    
    # Confirmation unless force flag is used
    if not force and not typer.confirm("\nAre you sure you want to reset the admin user and API key?"):
        typer.secho("Operation cancelled", fg=typer.colors.YELLOW)
        raise typer.Exit()
    
    # Show progress with spinner
    with typer.progressbar(length=2, label="Resetting admin access") as progress:
        # Reset admin user
        ensure_admin_user()
        progress.update(1)
        
        # Reset API key
        ensure_api_key_bootstrap()
        progress.update(1)
    
    # Success message
    success_message("Admin user and API key reset successfully!")
    info_message(f"Admin user '{auth_settings.DEFAULT_ADMIN_EMAIL}' with password '{auth_settings.DEFAULT_ADMIN_PASSWORD}' is now available.")
    info_message(f"Master API key '{api_key_settings.MASTER_KEY_NAME}' has been restored.")
    info_message("You can now log in to the system with these credentials.")

@admin_app.command("info")
def admin_info():
    """
    Display information about admin settings.
    
    Shows the current configuration for admin users and API keys
    without making any changes to the system.
    """
    section_title("Admin Configuration Information")
    
    # Admin user information
    typer.echo("\nAdmin User Settings:")
    info_message(f"Default Email: {auth_settings.DEFAULT_ADMIN_EMAIL}")
    info_message(f"Default Password: {auth_settings.DEFAULT_ADMIN_PASSWORD}")
    info_message(f"Default First Name: {auth_settings.DEFAULT_ADMIN_FIRST_NAME}")
    info_message(f"Default Last Name: {auth_settings.DEFAULT_ADMIN_LAST_NAME}")
    info_message(f"User JSON File: {auth_settings.USERS_FILE}")
    
    # API key information
    typer.echo("\nAPI Key Settings:")
    info_message(f"Master Key Name: {api_key_settings.MASTER_KEY_NAME}")
    info_message(f"API Key Header: {api_key_settings.API_KEY_HEADER_NAME}")
    info_message(f"API Keys File: {api_key_settings.API_KEYS_FILE}")

