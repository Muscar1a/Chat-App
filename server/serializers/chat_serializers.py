import schemas


def new_chat_serializer(member_ids):
    serialized_chat = schemas.PrivateChatModel(member_ids=member_ids)


def message_serializer(message: dict) -> schemas.MessageResponse:
    """
    Serialize message object to dictionary format for JSON response
    """
    # Nếu message là Pydantic model object
    if hasattr(message, 'model_dump'):
        message_dict = message.model_dump()
    # Nếu message đã là dictionary
    elif isinstance(message, dict):
        message_dict = message.copy()
    else:
        # Fallback: convert to dict
        message_dict = dict(message)
    
    # Convert datetime to ISO string format
    if 'created_at' in message_dict:
        if hasattr(message_dict['created_at'], 'isoformat'):
            message_dict['created_at'] = message_dict['created_at'].isoformat()
    
    return message_dict