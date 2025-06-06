
from .user import User
from .chat import PrivateChatResponse


class PrivateChatResponseWithRecipient(PrivateChatResponse):
    user_id: str
    recipient_profile: User