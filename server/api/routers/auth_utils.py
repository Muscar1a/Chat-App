import secrets
from fastapi import HTTPException, status
import datetime
from datetime import datetime, timedelta, timezone
RESET_TOKEN_TTL_HOURS = 1

async def create_password_reset_token(db, user):
    """
    - db: AsyncIOMotorDatabase instance
    - user: dict from your get_user_by_email(...)
    Returns the plaintext token to embed in the reset link.
    """
    token = secrets.token_urlsafe(32)   # ~ 256-bit URL-safe token
    expires_at = datetime.utcnow() + timedelta(hours=RESET_TOKEN_TTL_HOURS)

    await db["password_reset_tokens"].insert_one({
        "user_id": user["id"],
        "token": token,
        "expires_at": expires_at,
        "used": False,
    })
    return token