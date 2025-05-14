import typer
from app.core.bootstrap import ensure_admin_user, ensure_api_key_bootstrap

admin_app = typer.Typer(help="Admin management commands")

@admin_app.command("reset")
def reset_admin():
    """
    Reset the default admin user and API key.
    """
    ensure_admin_user()
    ensure_api_key_bootstrap()
    typer.secho("Admin user and API key reset successfully!", fg=typer.colors.GREEN)
