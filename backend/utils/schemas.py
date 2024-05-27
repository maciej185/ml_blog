from pydantic import BaseModel
from typing import Union, Any

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool = False
    user_id: int


class TokenData(BaseModel):
    username: Union[str, None] = None

class DocumentList(BaseModel):
    documents: list[dict[Any, Any]]