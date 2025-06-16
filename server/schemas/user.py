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
    public_key_pem: str
    private_key_pem: str

    token_version: int = Field(0)

class UserCreate(UserBase):
    password: str
    # password2: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password meets security requirements"""
        if len(v) < 8:
            raise ValueError("Mật khẩu phải có ít nhất 8 ký tự")
        
        if not re.search(r'[A-Z]', v):
            raise ValueError("Mật khẩu phải có ít nhất một chữ hoa")
        
        if not re.search(r'[a-z]', v):
            raise ValueError("Mật khẩu phải có ít nhất một chữ thường")
        
        if not re.search(r'\d', v):
            raise ValueError("Mật khẩu phải có ít nhất một số")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Mật khẩu phải có ít nhất một ký tự đặc biệt")
        
        return v
    
class UserRead(UserBase):
    id: str
    first_name: str | None
    last_name: str | None
    email: str | None = None
    is_active: bool
    is_online: bool
    is_disabled: bool
    roles: list[str] = [] 

User = UserRead

class UserUpdate(BaseModel):
    id: str
    password: Optional[str] = None
    # token_version: Optional[int] = None

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None

class UserUpdateToken(BaseModel):
    id: str
    # password: Optional[str] = None
    token_version: Optional[int] = None
    
class UserInDb(UserRead):
    private_message_recipients: list[MessageRecipient | None]
    group_chat_ids: list[str | None]


class UserOfAll(User):
    id: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v