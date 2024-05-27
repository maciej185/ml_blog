from pydantic import BaseModel
from datetime import date
from typing import Optional, Any

class Profile(BaseModel):
    first_name: str
    last_name: str
    country: str
    description: str
    date_of_birth: date

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str
    username : str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        orm_mode = True

class PostParagraphBase(BaseModel):
    text: str
    order: int
    post_id: int

class PostParagraphCreate(PostParagraphBase):
    pass

class PostParagraph(PostParagraphBase):
    id: int
    
    class Config:
        orm_mode = True

class CommentBase(BaseModel):
    text: str
    post_id: int
    
class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    create_date: date
    author_id: int
    author: User
    
    class Config:
        orm_mode = True

class PostBase(BaseModel):
    title: str
    model_interface_id: Optional[str]

class PostCreate(PostBase):
    paragraphs: list[str]
    

class Post(PostBase):
    id: int
    author_id: int
    paragraphs: list[PostParagraph] = []
    comments: list[Comment] = []
    author: User
    create_date: date

    class Config:
        orm_mode = True

class MlModel(BaseModel):
    _id: str
    name: str
    output_types: list[str]
    description: str
    url: str
    args: list[dict[str, str]]

class Prediction(BaseModel):
    model_name: str
    user_id: int
    input_params: dict[str, Any]
    output: Any