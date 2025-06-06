from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError

from crud.chat import PrivateChatManager
from service.token import TokenManager
from crud.user import User
from database import get_db
from schemas.token import TokenData
from config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase
import schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

async def get_user_manager(db: AsyncIOMotorDatabase = Depends(get_db)):
    return User(db)


async def get_token_manager(
    user_manager: User = Depends(get_user_manager)
):
    return TokenManager(user_manager)
    
    
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    token_manager: TokenManager = Depends(get_token_manager),
) -> schemas.User:
    """
    Decode the JWT, fetch the User document via Beanie,
    and return it (minus sensitive fields).
    """
    
    user_data = await token_manager.get_user_form_jwt_token(token, "id")
    if not user_data:
        raise credentials_exception
    
    try:
        return schemas.User(**user_data)
    except ValidationError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid user data")

# Dependency to create a User instance



async def get_current_active_user(
        current_user: schemas.User = Depends(get_current_user)
) -> schemas.User:

    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def requires_role(*allowed_roles: str):
    async def role_checker(
            current_user: schemas.User = Depends(get_current_user)):
        if not any(role in current_user.roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return role_checker

async def get_private_chat_manager(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_manager: User = Depends(get_user_manager)
):
    return PrivateChatManager(db, user_manager)