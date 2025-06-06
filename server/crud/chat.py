from fastapi import status, HTTPException
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from config import settings
from crud.user import User
from models import (
    MessageModel,
    MessageRecipientModel,
    PrivateChatModel)
import schemas
from serializers import serializers


class ChatNotFoundException(Exception):
    pass


class BaseChatManager:
    def __init__(self, db: AsyncIOMotorDatabase, chat_collection: str , user_manager: User):
        self.db = db
        self.chat_collection = self.db[chat_collection]
        self.user_manager = user_manager

    async def get_chat_by_id(self, chat_id: str) -> dict:
        chat = await self.chat_collection.find_one({'chat_id': chat_id})
        if not chat:
            raise ChatNotFoundException(f'Chat with id {chat_id} not found')
        return chat

    async def get_chat_messages(self, chat_id: str) -> list[schemas.Message]:
        chat = await self.get_chat_by_id(chat_id)
        return chat['messages']

    async def get_chats_from_ids(self, chat_ids: list[str]) -> list:
        # Query the collection for matching chat_ids
        matched_chats = await self.chat_collection.find(
            {'chat_id': {'$in': chat_ids}}
        ).to_list(None)
        return matched_chats

    async def insert_chat_to_db(self, new_chat) -> bool:
        result = await self.chat_collection.insert_one(new_chat.model_dump())
        if result.acknowledged:
            return True
        return False

    async def create_message(
        self,
        current_user_id: str,
        chat_id: str,
        message: str,
        encrypted_key_sender: str,
        encrypted_key_receiver: str,
        iv: str
    ) -> schemas.Message:

        chat = await self.get_chat_by_id(chat_id)

        if current_user_id not in chat.get('member_ids'):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='Message was not sent!'
            )

        new_message = MessageModel(
            created_by=current_user_id, message=message,
            encrypted_key_sender=encrypted_key_sender,
            encrypted_key_receiver=encrypted_key_receiver,
            iv=iv
        )
        print('\n - new_message full', new_message.model_dump())
        print('\n - new_message message only', new_message.model_dump()['message'])
        print('\n - new_message type', type(new_message.model_dump()['message']))
        

        result = await self.chat_collection.update_one(
            {'chat_id': chat_id},
            {'$push': {'messages': new_message.model_dump()}}
            # as I pushed new message inside messages,
            # it will not create any default '_id' for new message
            # if i use insert_one(), it will automatically create a '_id' field
        )

        if result.matched_count == 1 and result.modified_count == 1:
            return new_message


class PrivateChatManager(BaseChatManager):
    def __init__(self, db: AsyncIOMotorDatabase, user_manager: User):
        super().__init__(db, 'privateChat', user_manager)

    async def update_message_recipients(
        self,
        user_id: str,
        recipient_model: schemas.MessageRecipient
    ):
        result = await self.user_manager.update_one(
            {'id': user_id},
            {'$push': {'private_message_recipients': recipient_model.model_dump()}}
        )
        if result.matched_count == 1 and result.modified_count == 1:
            return True

    async def create_chat(
        self,
        current_user_id: str,
        recipient_id: str
    ) -> schemas.PrivateChat:
        print("-" * 50)
        print("-" * 50)
        
        ids = [current_user_id, recipient_id]
        new_chat = PrivateChatModel(member_ids=ids)
        print('----- new_chat', new_chat)

        inserted = await self.insert_chat_to_db(new_chat)
        # print('inserted', inserted)

        if not inserted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail='Chat not created.')

        # In member ids, one is user another is recipient
        # user1, recipient1  = recipient2, user2 = ids
        # message_recipient = [(user1, recipient1), (user2, recipient2)]
        # (user, recipient)
        message_recipients = [(ids[0], ids[1]), (ids[1], ids[0])]

        for user_id, recipient_id in message_recipients:
            recipient_model = MessageRecipientModel(
                recipient_id=recipient_id, chat_id=new_chat.chat_id)
            # print('recipient_model', recipient_model)

            # add chat_id to member's private_message_recipients field
            insertd = await self.user_manager.insert_private_message_recipient(
                user_id, recipient_model
            )
            if not insertd:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail='Message recipient was not added to user.'
                )

        return new_chat

    async def get_all_msg_recipients(self, user_id: str) -> list[schemas.MessageRecipient]:
        user = await self.user_manager.get_by_id(user_id)
        if user:
            return user["private_message_recipients"]
        return []

    async def get_all_chats(self, user_id: str):
        user = await self.user_manager.get_by_id(user_id)
        if user:
            chat_ids = [recipient['chat_id']
                        for recipient in user.get('private_message_recipients')]
            return await self.get_chats_from_ids(chat_ids)
        return []
    
    async def get_recipiet_id_from_chat_members(self, member_ids: list[str], current_user_id: str):

        recipiet_id = member_ids[0] if member_ids[1] == current_user_id else member_ids[1]
        return recipiet_id
    
    
    async def get_recipient_profile(self, member_ids: list[str], current_user_id:str) -> schemas.User:
        recipient_id = await self.get_recipiet_id_from_chat_members(member_ids, current_user_id)
        user = await self.user_manager.get_by_id(recipient_id)
        return user
    
    async def get_recepient(
            self, 
            current_user_id: str, 
            recipient_id: str
    ) -> schemas.MessageRecipient:
        # query = {
        #     'id': current_user_id,
        #     'private_message_recipients.recipient_id': recipient_id
        # }
        # Retrieve the user with the matching query
        # user = await self.chat_collection.find_one(query)

        user = await self.user_manager.get_by_id(current_user_id)
        # print('user[\'private_message_recipients\']: ', user['private_message_recipients'] )
        if user['private_message_recipients']:
            for recipient in user['private_message_recipients']:
                if recipient['recipient_id'] == recipient_id:
                    # print('--> recipient: ', recipient)
                    return recipient
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No private message recipients!'
        )

    async def find_private_chat(
        self,
        user1_id: str,
        user2_id: str   
    ) -> schemas.PrivateChat | None:
        """
        Return the existing private chat between user1_id and user2_id, or None if none exists.
        """
        raw = await self.chat_collection.find_one({
            "type": "private",
            "member_ids": {"$all": [user1_id, user2_id]},
        })
        if not raw:
            return None

        # normalize Mongo's _id → 24-hex id
        raw["id"] = str(raw["_id"])
        raw.pop("_id", None)

        return schemas.PrivateChat(**raw)

