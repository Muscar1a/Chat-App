import schemas
from core.security import get_password_hash, verify_password
from serializers import serializers
from models.user import UserModel
from fastapi import status, HTTPException
from schemas import (
    UserInDb, UserCreate, UserUpdate, Login, User,
    MessageRecipient
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from exceptions import UserCreationError
from config import settings
from bson import ObjectId 
from bson.errors import InvalidId


class BaseUserManager:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.user_collection = self.db['users']

    async def get_by_id(self, id: str) -> UserInDb:
        # 1) ensure it’s a valid 24-hex string and convert
        try:
            oid = ObjectId(id)
        except Exception:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        # 2) lookup by the real _id
        user = await self.user_collection.find_one({'_id': oid})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f'User not found')
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        return user

    async def get_by_email(self, email: str) -> UserInDb:
        doc = await self.user_collection.find_one({"email": email})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f'User not found')
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        return doc


    async def get_by_username(self, username: str) -> UserInDb:
        user = await self.user_collection.find_one({'username': username})
        return user
    

    async def get_all(self) -> list[User]:
        users = await self.user_collection.find({}).to_list(length=None)
        return [serializers.user_serializer(user) for user in users]
    
    async def update_online_status(self, user_id: str, is_online: bool) -> bool:
        """Update user online status."""
        try:
            oid = ObjectId(user_id)
            result = await self.user_collection.update_one(
                {'_id': oid},
                {'$set': {'is_online': is_online}}
            )
            return result.matched_count == 1 and result.modified_count == 1
        except InvalidId:
            return False

    async def get_all_except_me(self, current_user_id: str) -> list[schemas.User]:
        all_users = await self.get_all()
        # print(all_users)
        return [user for user in all_users if user.id != current_user_id]

    async def insert_private_message_recipient(
            self,
            user_id: str,
            recipient_model: MessageRecipient
    ):
        print('[-] Inserting user id:', user_id)
        print('[-] Inserting recipient:', recipient_model.model_dump())
        result = await self.user_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$push': {'private_message_recipients': recipient_model.model_dump()}}
        )
        print('[-] Result:', result)
        print('[-] Matched count:', result.matched_count)
        print('[-] Modified count:', result.modified_count)
        if result.matched_count == 1 and result.modified_count == 1:
            return True
        

class UserDBManager(BaseUserManager):
    async def authenticate(self, user_data: Login) -> UserInDb:
        user = await self.get_by_username(user_data.username)
        # print('user', user)
        if not user or not verify_password(user_data.password, user.get('password')):
            return None
        return user


class UserCreator(BaseUserManager):
    async def create_user(self, user_data: UserCreate) -> UserInDb:
        """Create a new user with hashed password."""
        existing = await self.user_collection.find_one({'username': user_data.username})
        if existing:
            raise UserCreationError('username', 'Username already in use!')
        password_hash = get_password_hash(user_data.password)
        updated_user_data = {
            **user_data.model_dump(),
            'password': password_hash,
            "roles": ["user"],
            "token_version": 0, 
        }
        new_user = UserModel(**updated_user_data)
        payload  = new_user.model_dump(exclude={"id"})
        result   = await self.user_collection.insert_one(payload)
        if result.acknowledged:
            oid_str = str(result.inserted_id)
            return await self.get_by_id(oid_str)

        raise UserCreationError('User creation failed', 'Write not acknowledged')


class UserUpdater(BaseUserManager):
    async def update_user(self, updated_data: UserUpdate) -> UserInDb:
        """Update user data."""
        # validate & cast
        try:
            oid = ObjectId(updated_data.id)
        except InvalidId:
            raise HTTPException(400, "Invalid user ID format")
        result = await self.user_collection.update_one(
            {'_id': oid},
            {'$set': updated_data.model_dump()}
        )

        if result.matched_count == 1 and result.modified_count == 1:
            return await self.get_by_id(updated_data.id)
        return None

    async def update_profile(self, user_id: str, profile_data: dict) -> UserInDb:
        """Update user profile data."""
        try:
            oid = ObjectId(user_id)
        except InvalidId:
            raise HTTPException(400, "Invalid user ID format")
        
        # Remove None values to avoid overwriting existing data with None
        update_data = {k: v for k, v in profile_data.items() if v is not None}
        
        if not update_data:
            return await self.get_by_id(user_id)
        
        result = await self.user_collection.update_one(
            {'_id': oid},
            {'$set': update_data}
        )

        if result.matched_count == 1:
            return await self.get_by_id(user_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )


class UserDeleter(BaseUserManager):
    async def delete_user(self, id: str) -> dict:
        """Delete a user by ID."""
        user = await self.get_by_id(id)
        deleted = await self.user_collection.delete_one({'id': ObjectId(id)})

        if deleted.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='User not deleted'
            )

        user.pop('_id', None)
        return user


class User(UserDBManager, UserCreator, UserUpdater, UserDeleter):
    pass