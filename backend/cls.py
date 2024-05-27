"""Module with commands for managing the app."""
import typer

from sql_app.database import SessionLocal
from sql_app.schemas import UserCreate
from sql_app.crud import create_user

app = typer.Typer(no_args_is_help=True)

@app.command()
def create_admin(email:str, username: str, password: str) -> None:
    """Create an admin user with the provided credentials."""
    db = SessionLocal()
    db_user = UserCreate(email=email, username=username, password=password)
    create_user(db=db, user=db_user, is_admin=True)
    db.close()



if __name__ == "__main__":
    app()

