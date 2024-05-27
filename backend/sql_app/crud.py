from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from . import models, schemas
from utils import get_password_hash, CredentialTakenError

def create_profile(db: Session, user: models.User) -> None:
    """Add a new row to the 'Profiles' table.
    
    The function adds a new row to the 'Profiles'
    table where the only inserted value is in the 
    'user_id' column.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        user: an instance of the SQLAlchemy model,
                representing a row in the 'Users'
                table.
    """
    db_profile = models.Profile(user_id=user.id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

def get_profile(db: Session, user: schemas.User) -> models.Profile:
    """Fetch particular row from 'Profiles' table.
    
    The function queries the db to fetch the info
    about a particular Profile based on the 
    User info.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        user: An instance of the 'User' pydantic
                model, representing the user
                for which profile info will be 
                fetched.
    Returns:
        An instance of the SQLAlchemy model,
        representing a row in the 'Profiles'
        table.
    """
    return db.query(models.Profile).filter(models.Profile.user_id == user.id).first()

def update_profile(db: Session, profile: schemas.Profile, user:models.User) -> models.Profile:
    """Update and returm udpated profile.
    
    The method first fetches the profile corresponding
    to a particular user, updated the info based on the 
    provided data and commits the changes to the database.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        user: an instance of the SQLAlchemy model,
                representing a row in the 'Users'
                table.
        profile: An instance of the 'Profile'
                    pydantic model, containing data
                    that is meant to be inserted into 
                    the database.
    Returns:
        An updated instance of the 'Profile' SQLAlchemy model,
        representing a particular row in the 'Profiles' table.
    """
    db_profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first() 
    db_profile.first_name = profile.first_name
    db_profile.last_name = profile.last_name
    db_profile.country = profile.country
    db_profile.description = profile.description
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_user(db: Session, user_id: int)  -> models.User:
    """Fetch a partciular row from the 'Users' table.
    
    The method queries the database to fetch info 
    about a particular User.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        user_id: Value of the 'id' column from the 
                'Users' table for which the data
                will be fetched.
    Returns:
        An instance of the 'User' SQLAlchemy model,
        representing a row with the data about the 
        User with provided ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str)  -> models.User:
    """Fetch a partciular row from the 'Users' table.
    
    The method queries the database to fetch info 
    about a particular User.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        email: Value of the 'email' column from the 
                'Users' table for which the data
                will be fetched.
    Returns:
        An instance of the 'User' SQLAlchemy model,
        representing a row with the data about the 
        User with provided email.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str) -> models.User:
    """Fetch a partciular row from the 'Users' table.
    
    The method queries the database to fetch info 
    about a particular User.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        email: Value of the 'username' column from the 
                'Users' table for which the data
                will be fetched.
    Returns:
        An instance of the 'User' SQLAlchemy model,
        representing a row with the data about the 
        User with provided username.
    """
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate, is_admin=False) -> models.User:
    """Add a new row to the 'Profiles' table.
    
    The function inserts a new row the database 
    with the information provided in the pydantic 
    model.
    
    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        user: an instance of the 'User' pydatnic 
            model, containing validated data 
            that is meant to be stored in the
            inserted row.
        is_admin: Indicates the value of the 
                    'is_admin' column in the db.

    Raises:
        sqlalchemy.exc.IntegrityError: Raised when the provided username or 
                                    email are already registered in the db.
    
    Returns:
        An instance of the 'User' SQLAlchemy model,
        representing the newly created row in the 
        'Users' table.
    """
    db_user = models.User(email=user.email, username=user.username, hashed_password=get_password_hash(user.password), is_admin=is_admin)
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError as e:
        mes = e._message()
        if "username" in mes:
            raise CredentialTakenError("Username already taken.")
        elif "email" in mes:
            raise CredentialTakenError("Email already taken.")
    db.refresh(db_user)
    create_profile(db=db, user=db_user)
    return db_user

def create_post(db: Session, post_data: schemas.PostCreate, user: models.User) -> models.Post:
    """Create post based on the provided data.
    
    The function adds new rows to the 'Post'
    and 'PostParagraphs' tables with the values
    provided as arguments.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

        post_data: an instance of the pydantic
                    model that holds most data of the 
                    Post that is about to be created.  

        user: an instance of the SQLAlchemy model,
                representing a row in the 'Users'
                table who is going to be assigned as the 
                author of the Post.
    
    Returns:
        An instance of the models.Post model (inherits from SQLAlchemy model)
        that represents the newly created Post object/row in the db.
    """
    db_post = models.Post(author_id=user.id, title=post_data.title, model_interface_id=post_data.model_interface_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    for order_ind, text_paragraph in enumerate(post_data.paragraphs):
        db_paragraph = models.PostParagraph(post_id = db_post.id, text=text_paragraph, order=order_ind)
        db.add(db_paragraph)
        db.commit()
        db.refresh(db_paragraph)
    
    return db_post


def get_post(db: Session, post_id: int)  -> models.Post:
    """Fetch a partciular row from the 'Post' table.
    
    The method queries the database to fetch info 
    about a particular Post.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        post_id: Value of the 'id' column from the 
                'Post' table for which the data
                will be fetched.
    Returns:
        An instance of the 'Post' SQLAlchemy model,
        representing a row with the data about the 
        Post with provided ID.
    """
    return db.query(models.Post).filter(models.Post.id == post_id).first()


def get_posts(db: Session, user_id: int) -> list[models.Post]:
    """Get every Posts created by the given User.
    
    The method fetches every Post authored
    by the provided user.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

        user_id: ID of the row in the 'Users'
                table, repesenting the author 
                of the posts.

    Returns:
        A list of instances of the models.Post class 
        (inherits from SQLAlchemy), represenetinting
        Posts created by the provided User.
    """
    return db.query(models.Post).filter(models.Post.author_id==user_id).all()

def get_posts_all(db: Session) -> list[models.Post]:
    """Get every Posts from the db.
    
    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

    Returns:
        A list of instances of the models.Post class 
        (inherits from SQLAlchemy), represenetinting
        every Posts in the db.
    """
    return db.query(models.Post).all()

def create_comment(db: Session, comment_data: schemas.CommentCreate, user: models.User) -> models.Comment:
    """Insert row into the 'comments' table with the provided data.
    
    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

        comment_data: an instance of the pydantic
                    model that holds most data of the 
                    Comment that is about to be created.  

        user: an instance of the SQLAlchemy model,
                representing a row in the 'Users'
                table who is going to be assigned as the 
                author of the Post.
    
    Returns:
        An instance of the models.Comment model (inherits from SQLAlchemy model)
        that represents the newly created Comment object/row in the db.
    """
    db_comment = models.Comment(author_id=user.id, post_id=comment_data.post_id, text=comment_data.text)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment

def get_comments(db: Session, post_id: int) -> list[models.Comment]:
    """Get every Comment for a given Post.
    
    The method fetches every Comment published
    under a given Post.

    Args:
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

        post_id: ID of the Post for which the 
                    Comments will be fetched.

    Returns:
        A list of instances of the models.Comment class 
        (inherits from SQLAlchemy), represenetinting
        Comment published under a given Post.
    """
    return db.query(models.Comment).filter(models.Comment.post_id==post_id).all()