from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from schemas.chat import MessageRecipient
from utils import(
    datetime_now, 
    get_uuid4
)

class UserModel(BaseModel):
    id: str = Field(default_factory=get_uuid4)
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    username: str = Field(..., max_length=20)
    email: EmailStr = Field(..., max_length=50)
    password: str = Field(...) 
    
    is_active: bool = True
    is_online: bool = False
    is_disabled: bool = False     
    is_superuser: bool = False               
    private_message_recipients: list[MessageRecipient | None] = Field([])
    group_chat_ids: list[str | None] = Field([])
    token_version: int = Field(0)
    class Config:
           schema_extra = {
            "example": {
                "id": "00010203-0405-0607-0809-0a0b0c0d0e0f",
                "first_name": "John",
                "last_name": "Doe",
                "username": "johndoe",
                "email": "johndoe@example.com",
                "password": "password123",
                "active": True
            }
        }
    
    @classmethod
    def __repr__(cls):
        return f'{cls.first_name}'