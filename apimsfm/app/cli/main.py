import typer

app = typer.Typer()

def welcome():
    typer.secho("""
╔══════════════════════════════════════════════╗
║   WELCOME TO THE SMART LEGAL CONTRACT CLI ║
╚══════════════════════════════════════════════╝
""", fg=typer.colors.CYAN, bold=True)

    typer.echo("What would you like to do today?\n")
    typer.echo("[1] Reset Admin User and API Key")
    typer.echo("[2] Exit\n")

    choice = typer.prompt("Enter your choice", type=int)

    if choice == 1:
        from app.core.bootstrap import ensure_admin_user, ensure_api_key_bootstrap
        ensure_admin_user()
        ensure_api_key_bootstrap()
        typer.secho("Admin user and API key reset successfully!", fg=typer.colors.GREEN)

    elif choice == 2:
        typer.secho(" Exiting...", fg=typer.colors.YELLOW)

    else:
        typer.secho("Invalid choice.", fg=typer.colors.RED)

if __name__ == "__main__":
    welcome()
