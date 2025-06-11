import re
from pydantic import BaseModel, field_validator, constr, Field
from typing import Optional, Annotated

from schemas.chat import MessageRecipient

ObjectIdStr = constr(
    min_length=24,
    max_length=24,
    pattern=r"^[0-9a-fA-F]{24}$"
)

UsernameStr = constr(
    min_length=3,
    max_length=30,
    pattern=r"^[A-Za-z0-9_]+$"
)

class UserBase(BaseModel):
    username: Annotated[str, UsernameStr]
    # firstName: str
    # lastName: str
    email: str

    token_version: int = Field(0)

class UserCreate(UserBase):
    password: str
    # password2: str
    
class UserRead(UserBase):
    id: ObjectIdStr
    first_name: str | None
    last_name: str | None
    is_active: bool
    is_online: bool
    is_disabled: bool
    roles: list[str] = [] 

User = UserRead

class UserUpdate(BaseModel):
    id: str
    password: Optional[str] = None
    # token_version: Optional[int] = None

class UserUpdateToken(BaseModel):
    id: str
    # password: Optional[str] = None
    token_version: Optional[int] = None
    
class UserInDb(UserRead):
    private_message_recipients: list[MessageRecipient | None]
    group_chat_ids: list[str | None]


class UserOfAll(User):
    id: str