"""
Output formatting utilities for the CLI.
"""
import typer
from typing import Any

def section_title(title: str) -> None:
    """
    Display a formatted section title.
    """
    typer.secho(f"\n{title}", fg=typer.colors.BLUE, bold=True)

def info_message(message: str) -> None:
    """
    Display an information message.
    """
    typer.echo(f"  {message}")

def success_message(message: str) -> None:
    """
    Display a success message.
    """
    typer.secho(f"\n {message}", fg=typer.colors.GREEN)

def warning_message(message: str) -> None:
    """
    Display a warning message.
    """
    typer.secho(f" {message}", fg=typer.colors.YELLOW)

def error_message(message: str) -> None:
    """
    Display an error message.
    """
    typer.secho(f" {message}", fg=typer.colors.RED, err=True)

def table(headers: list[str], rows: list[list[Any]]) -> None:
    """
    Display data in a formatted table.
    """
    # Calculate column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(cell)))
    
    # Print headers
    header_row = " | ".join(h.ljust(w) for h, w in zip(headers, col_widths))
    typer.echo(header_row)
    typer.echo("-" * len(header_row))
    
    # Print rows
    for row in rows:
        row_str = " | ".join(str(c).ljust(w) for c, w in zip(row, col_widths))
        typer.echo(row_str)