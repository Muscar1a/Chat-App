from fastapi import Depends, HTTPException, status
import schemas
from datetime import datetime, timedelta
from config import settings
from exceptions import credentials_exception
from crud.user import User
from itsdangerous import URLSafeTimedSerializer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone


class TokenManager:
    def __init__(self, user_manager: User):
        self.user_manager = user_manager
        self.jwt_secret_key = settings.SECRET_KEY
        self.jwt_algorithm = settings.ALGORITHM
        # short-lived access tokens
        self.access_expires  = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        # longer-lived refresh tokens
        self.refresh_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    async def get_jwt_access_token(self, subject: str) -> str:
        user = await self.user_manager.get_by_id(subject)
        now = datetime.now(timezone.utc)
        expire = now + self.access_expires
        payload = {
            "exp": expire, 
            "sub": subject,
            "iat": now,
            "type": "access",
            "ver": user.get("token_version", 0),
        }
        return jwt.encode(payload, self.jwt_secret_key, algorithm=self.jwt_algorithm)

    async def get_jwt_refresh_token(self, subject: str) -> str:
        user = await self.user_manager.get_by_id(subject)
        now = datetime.now(timezone.utc)
        expire = now + self.refresh_expires
        payload = {
            "exp": expire,
            "sub": subject,
            "iat": now,
            "type": "refresh",
            "ver": user.get("token_version", 0),
        }
        return jwt.encode(payload, self.jwt_secret_key, algorithm=self.jwt_algorithm)   

    async def get_data_form_jwt_token(self, token) -> schemas.TokenPayload:
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret_key,
                algorithms=[self.jwt_algorithm]
            )
            tokentype = payload.get("type")
            if tokentype not in ("access", "refresh"):
                raise credentials_exception
            subject: str = payload.get("sub")
            if subject is None:
                raise credentials_exception
            return payload
        except JWTError:
            raise credentials_exception

    async def get_user_form_jwt_token(self, token: str, subject_key: str) -> schemas.User:
        token_data = await self.get_data_form_jwt_token(token)
        user = await self.user_manager.get_by_id(token_data["sub"])
        if token_data.get("ver") != user["token_version"]:
            raise credentials_exception 
        subject = token_data.get("sub")

        if subject_key == "id":
            user = await self.user_manager.get_by_id(subject)
        elif subject_key == "email":
            user = await self.user_manager.get_by_email(subject)

        if not user:
            raise credentials_exception
        return user