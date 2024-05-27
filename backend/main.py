from datetime import datetime, timedelta, timezone
from typing import Annotated, Union, Optional, Literal, Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt

from sqlalchemy.orm import Session
from sql_app.main import get_db

from sql_app import schemas, crud, models
from utils import oauth2_scheme, verify_password, TokenData, Token, CredentialTakenError, DocumentList
from no_sql_app import get_mongo_db, get_documents, get_model_by_id, save_prediction, get_predictions

from fastapi.middleware.cors import CORSMiddleware

from pymongo import database


# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "32d3a0a550c90b2ed425d86cfd423548ab552aeae6a23d8ce279854efedfb9dd"
ALGORITHM = "HS256"

ORIGINS = [
    "*",
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def authenticate_user(username: str, password: str, db: Session) -> Union[bool, models.User]:
    """Return User object from the DB.
     
    The method taked advantage of one of the
    previously implemented CRUD methods for fetching 
    a User object from the DB and attempt to perform
    the fetch and verify the input password.

    Args:
        username: username that's used to perform the search
                        in the DB.
        password: password that is verified against the fetched
                    User object.
        db: instance of the sqlalchemy.orm.Session 
                class, representing the current
                db session, unique for a given
                request.
    """
    user = crud.get_user_by_username(db=db, username=username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db=db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
) -> Token:
    user = authenticate_user(form_data.username, form_data.password, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username}
    )
    return Token(access_token=access_token, token_type="bearer", is_admin=user.is_admin, user_id=user.id)


@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(
    current_user: Annotated[schemas.User, Depends(get_current_active_user)],
):
    return current_user

@app.post("/register")
def register(user_create: schemas.UserCreate,  db: Session = Depends(get_db)):
    try:
        user = crud.create_user(db=db, user=user_create)
    except CredentialTakenError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    db.refresh(user)
    return schemas.User(**user.__dict__)

@app.get("/profile", response_model=schemas.Profile)
def get_profile(
    current_user: Annotated[schemas.User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """Return Profile info of the currently logged in user."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return crud.get_profile(db=db, user=current_user)

@app.post("/profile/update", response_model=schemas.Profile)
def update_profile(
    profile_form: schemas.Profile,
    current_user: Annotated[schemas.User, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
) -> schemas.Profile:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized",
            headers={"WWW-Authenticate": "Bearer"},
        )
    profile = crud.update_profile(
        db=db,
        profile=profile_form,
        user=current_user
        )
    return profile

@app.post("/post/create", response_model=schemas.Post)
def create_post(post_data: schemas.PostCreate,
                current_user: Annotated[schemas.User, Depends(get_current_active_user)], 
                db: Session = Depends(get_db)) -> schemas.Post:
    """Endpoint for creating posts.
    
    There is a check made to ensure that the user is logged in
    so that the post's author could be correctly set. Then, the
    provided Post data  is validated by a pydantic model to 
    ensure correctness. It is then passed to an appropraite CRUD
    function that returns the created Post. 

    Args:
        post_data: An instance of the pydantic schemas.PostCreate
                        models which contains only the fields that 
                        can be provided by the user, with exclusion 
                        of fields like IDs.
        current_user: An instance of the models.User class, representing
                        the currently logged in user.
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
    Raises:
        HTTPException: raised when the user is not logged in.

    Returns:
        An instance of the models.Post class, representing the 
        Post object in the database with inclusion of IDs.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized",
            headers={"WWW-Authenticate": "Bearer"},
        )
    post = crud.create_post(
        db=db,
        post_data=post_data,
        user=current_user
    )
    return post

@app.get("/post/list", response_model=list[schemas.Post])
def get_posts(
            current_user: Annotated[schemas.User, Depends(get_current_active_user)], 
            db: Session = Depends(get_db),
            user_id: Optional[int] = None,) -> list[models.Post]:
    """Fetch and return a list of Posts created by a given user.
    
    Args:
        
        current_user: An instance of the models.User class, representing
                        the currently logged in user.
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
        user_id: ID of the posts' author, provided as a query parameter.
                     If None, the 
                    posts of the currently logged in user 
                    are fetched. If the user is not logged in, 
                    an exception is thrown.

    Raises: 
        HTTPException - raised when the 'user_id' was not 
        provided and the sender of the request is not 
        authorized.

    Returns:
        A list of instances of the models.Post class 
        (inherits from SQLAlchemy), represenetinting
        Posts created by the provided or currently 
        logged in user.
    """
    if user_id:
        return crud.get_posts(db=db, user_id=user_id)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized. Either provided ID of the author as a 'user_id' query parameter or log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return crud.get_posts(db=db, user_id=current_user.id)

@app.get("/post/list/all", response_model=list[schemas.Post])
def get_posts_all(db: Session = Depends(get_db),) -> list[models.Post]:
    """Fetch and return all posts.

    db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

    Returns:
        A list of instances of the models.Post class 
        (inherits from SQLAlchemy), represenetinting
        all Posts currently stored in the db.
    """
    return crud.get_posts_all(db=db)


@app.get("/post/{post_id}", response_model=schemas.Post)
def get_post(post_id: int, 
            db: Session = Depends(get_db)) -> models.Post:
    """Fetch and return a Post from the db.
    
    Args:
        post_id: ID of the Post that is meant to be fetched.
        
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.
    """
    return crud.get_post(db=db, post_id=post_id) 

@app.get("/model/{model_id}", response_model=schemas.MlModel)
def get_model(model_id: str,
              current_user: Annotated[schemas.User, Depends(get_current_active_user)], 
              mongo_db: database.Database = Depends(get_mongo_db)) -> schemas.MlModel:
    """Fetch and return a representation of a model from the db.
    
    Args:
        model_id: ID of the desired model, _id field
                in a MongoDB Document.
        current_user: An instance of the models.User class, representing
                        the currently logged in user.
        mongo_db: An instance of the database.Database,
                representing a single MongoDB database.

    Raises: 
        HTTPException - raised when the sender 
        of the request is not authorized.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return get_model_by_id(_id=model_id, mongo_db=mongo_db)


@app.get("/mongo/{collection_name}", response_model=DocumentList)
def get_documents_from_collection(collection_name: str,
                  mongo_db: database.Database = Depends(get_mongo_db)) -> DocumentList:
    """List all documents in a given collection
    
    Args:
        collection_name: Name of collection from which documents 
                        are meant to be fetched.
        mongo_db: Instance of the pymongo.database.Database, representing
                    the mongoDB database used throughout the application.

    Returns:
        A instance of the DocumentList pydantic model with a list of 
        dictionaries, each representing a document from the given collection. 
    """
    docs = get_documents(collection_name=collection_name, mongo_db=mongo_db)
    return DocumentList(documents=docs)

@app.post("/model/prediction")
def save_models_prediction(
            prediction_data: schemas.Prediction,
            current_user: Annotated[schemas.User, Depends(get_current_active_user)], 
            mongo_db: database.Database = Depends(get_mongo_db)) -> dict[Literal["success"], bool]:
    """Save prediction for any model in the MongoDB.

    Args:
        prediction: A pydantic Prediction model, containing info about 
                    the user, the model and input as well as output 
                    parameters.
        current_user: An instance of the models.User class, representing
                        the currently logged in user.
        mongo_db: An instance of the database.Database,
                representing a single MongoDB database.

    Raises: 
        HTTPException - raised when the sender 
        of the request is not authorized.

    Return:
        A dictionary with containing info whether the operation
        was successful.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    save_prediction(prediction_data=prediction_data.model_dump(mode='json'), mongo_db=mongo_db)
    return {'success': True}
    
@app.get("/predictions")
def get_model_predictions(current_user: Annotated[schemas.User, Depends(get_current_active_user)], 
            mongo_db: database.Database = Depends(get_mongo_db)) -> list[dict[Any, Any]]:
    """Return predictions generated by the currently logged in user.
    
    Args:
        current_user: An instance of the models.User class, representing
                        the currently logged in user.
        mongo_db: An instance of the database.Database,
                representing a single MongoDB database.
    
    Raises: 
        HTTPException - raised when the sender 
        of the request is not authorized.

    Return:
        A list of dictionaries with information about 
        predictions made by the user.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return get_predictions(user_id=current_user.id, mongo_db=mongo_db)

@app.post('/post/comment', response_model=schemas.Comment)
def post_comment(
            comment_data: schemas.CommentCreate,
            current_user: Annotated[schemas.User, Depends(get_current_active_user)], 
            db: Session = Depends(get_db)) -> models.Comment:
    """Post a comment under given Post.
    
    Args:
        comment_data: an instance of the pydantic
                    model that holds most data of the 
                    Comment that is about to be created. 
        current_user: An instance of the models.User class, representing
                        the currently logged in user.
        db: instance of the sqlalchemy.orm.Session 
                    class, representing the current
                    db session created for a given
                    request.

    Raises: 
        HTTPException - raised when the sender 
        of the request is not authorized.

    Returns:
        An instance of the models.Comment class, representing the 
        Comment object in the database with inclusion of IDs.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized.",
            headers={"WWW-Authenticate": "Bearer"},
        )    
    return crud.create_comment(db=db, comment_data=comment_data, user=current_user)

@app.get("/post/{post_id}/comments", response_model=list[schemas.Comment])
def get_comments(post_id: int,
                 db: Session = Depends(get_db)) -> list[models.Comment]:
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
    return crud.get_comments(db=db, post_id=post_id)
