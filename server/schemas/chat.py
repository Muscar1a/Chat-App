from datetime import datetime
from pydantic import BaseModel


class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: str
    created_by: str
    created_at: datetime  
    encrypted_key_sender: str
    encrypted_key_receiver: str
    iv: str

class MessageResponse(Message):
    created_at: str
    
    
class ChatId(BaseModel):
    chat_id: str


class MessageRecipient(ChatId):
    recipient_id: str


class ChatBase(ChatId):
    member_ids: list[str]
    messages: list[Message | None]
    type: str


class PrivateChat(ChatBase):
    pass


class PrivateChatResponse(ChatBase):
    pass



class GroupChat(ChatBase):
    chat_name: str | None


class GroupChatResponse(GroupChat):
    pass


class ChatCreationResponse(BaseModel):
    message: str
    chat: PrivateChat