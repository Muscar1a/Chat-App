from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, field_validator
import re
from jose import JWTError
from datetime import datetime
import datetime
from datetime import datetime, timezone, timedelta

from api.deps import get_token_manager, get_user_manager, get_current_active_user
from service.token import TokenManager
from schemas.token import Token
import schemas
from crud.user import User
from core.security import (
    create_password_reset_token,
    verify_password,
    get_password_hash,
)
from .auth_utils import create_password_reset_token
from core.email import send_reset_email
from schemas import UserUpdate, UserUpdateToken

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

@router.post("/login", response_model=schemas.Token)
@limiter.limit("5/minute")  
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_manager: User = Depends(get_user_manager),
    token_manager: TokenManager = Depends(get_token_manager),
) -> Any:
    user = await user_manager.authenticate(form_data)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect username or password",
        )
    subject = str(user['_id'])
    """
        Here we use id for further access token generation.
    """
    await user_manager.update_online_status(subject, True)

    access_token = await token_manager.get_jwt_access_token(subject)
    refresh_token = await token_manager.get_jwt_refresh_token(subject)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


class PasswordResetRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    """
    @field_validator("new_password")
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must include at least one special character")
        if not re.search(r"\d", v):
            raise ValueError("Password must include at least one digit")
        return v
    """
    
# request reset
@router.post("/request-password-reset")
@limiter.limit("2/10minute")
async def request_password_reset(
    request: Request,
    req: PasswordResetRequest,
    user_manager: User = Depends(get_user_manager),
):
    user = await user_manager.get_by_email(req.email)
    # Always 200 to avoid email enumeration
    if user:
        token = await create_password_reset_token(user_manager.db, user)
        await send_reset_email(user["email"], token)
    return {"msg": "If that email is registered, you’ll receive reset instructions."}

# reset password
@router.post("/reset-password")
@limiter.limit("2/10minute")
async def reset_password(
    request: Request,
    req: ResetPasswordRequest,
    user_manager: User = Depends(get_user_manager),
):
    # validate & decode token
    token_doc = await user_manager.db["password_reset_tokens"].find_one({"token": req.token})
    if (
        not token_doc
        or token_doc["used"]
        or token_doc["expires_at"] < datetime.utcnow()
    ):
        raise HTTPException(400, "Invalid or expired token")

    # fetch user
    user = await user_manager.get_by_id(token_doc["user_id"])
    if not user:
        raise HTTPException(404, "User not found")

    # forbid same‐as‐old
    if verify_password(req.new_password, user.get('password')):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password"
        )

    # hash & update
    hashed = get_password_hash(req.new_password)
    updated = UserUpdate(id=user["id"], password=hashed)
    await user_manager.update_user(updated)

    # mark token as used
    await user_manager.db["password_reset_tokens"].update_one(
        {"_id": token_doc["_id"]},
        {"$set": {"used": True}}
    )

    return {"msg": "Password has been reset successfully."}

@router.post("/logout")
async def logout(
    current_user: schemas.User = Depends(get_current_active_user),
    user_manager: User = Depends(get_user_manager),
    ):
    await user_manager.update_online_status(current_user.id, False)
    
    # Lấy user hiện tại để biết token_version
    user = await user_manager.get_by_id(current_user.id)
    
    # Tạo đối tượng UserUpdate với token_version tăng lên
    updated_data = UserUpdateToken(
        id=current_user.id,
        token_version=user.get('token_version', 0) + 1
    )
    
    # Cập nhật user với token_version mới
    print("[DEBUG] Logging out user:", current_user.id)
    await user_manager.update_user(updated_data)
    
    return {"msg": "Logged out and revoked prior tokens"}

