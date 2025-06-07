from datetime import datetime
from schemas.chat import Message
from pydantic import BaseModel, Field
from utils import(
    datetime_now, 
    get_uuid4
)

class MessageRecipientModel(BaseModel):
    recipient_id: str = Field(...)
    chat_id: str = Field(...)


class MessageModel(BaseModel):
    id: str = Field(default_factory=get_uuid4)
    message: str = Field(...)
    # encrypted_key_sender: str = Field(...)
    # encrypted_key_receiver: str = Field(...)
    # iv: str = Field(...)
    created_by: str = Field(...)
    created_at: datetime = Field(default_factory=datetime_now)

class ChatBaseModel(BaseModel):
    chat_id: str = Field(default_factory=get_uuid4)
    member_ids: list[str] = Field(...)
    messages: list[Message | None] = Field([])

class PrivateChatModel(ChatBaseModel):
    type: str = Field(default='private')

class GroupChatModel(ChatBaseModel):
    type: str = Field(default='group')
    chat_name: str | None = Field(None)

