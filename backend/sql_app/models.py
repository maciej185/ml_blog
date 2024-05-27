from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
import datetime

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(40), unique=True, index=True)
    email = Column(String(40), unique=True, index=True)
    hashed_password = Column(String(200))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="user")
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")


class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    first_name = Column(String(40), default='')
    last_name = Column(String(40), default='')
    country = Column(String(40), default='')
    description = Column(String(40), default='')
    create_date = Column(Date, default=datetime.datetime.now())
    date_of_birth = Column(Date, default=datetime.datetime.now())

    user = relationship("User", back_populates="profile")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    create_date = Column(Date, default=datetime.datetime.now())
    title = Column(String(40))
    model_interface_id = Column(String(100))

    author = relationship("User", back_populates="posts")
    paragraphs = relationship("PostParagraph", back_populates="post")
    comments = relationship("Comment", back_populates="post")

class PostParagraph(Base):
    __tablename__ = "paragraphs"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    text = Column(String(500))
    order = Column(Integer)

    post = relationship("Post", back_populates="paragraphs")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))
    text = Column(String(40))
    create_date = Column(Date, default=datetime.datetime.now())

    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
