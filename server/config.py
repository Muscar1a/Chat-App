from pydantic import Field
import logging
import os
from random import randint
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class GlobalSettings(BaseSettings):
    # app settings
    ENVIRONMENT: str = Field(..., env="ENVIRONMENT")
    ALLOWED_ORIGINS: str = Field(..., env="ALLOWED_ORIGINS")

    # Logging
    LOG_LEVEL: int = logging.DEBUG

    # Sentry
    SENTRY_DSN: str = ""

    # MongoDB
    MONGODB_URL: str = Field(..., env="MONGODB_URL")
    MONGODB_DB_NAME: str = Field(..., env="MONGODB_DB_NAME")
    USERS_COLLECTION: str = Field(..., env="USERS_COLLECTION")

    # Authentication
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field(..., env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(..., env="ACCESS_TOKEN_EXPIRE_MINUTES")
    PASSWORD_RESET_EXPIRE_MINUTES: int = Field(..., env="PASSWORD_RESET_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(..., env="REFRESH_TOKEN_EXPIRE_DAYS")

    # SMTP
    SMTP_HOST: str = Field(..., env="SMTP_HOST")
    SMTP_PORT: int = Field(..., env="SMTP_PORT")
    SMTP_USER: str = Field(..., env="SMTP_USER")
    SMTP_PASSWORD: str = Field(..., env="SMTP_PASSWORD")
    EMAIL_FROM: str = Field(..., env="EMAIL_FROM")

    # Password-reset URL
    FRONTEND_URL: str = Field(..., env="FRONTEND_URL")

    # SSL/TLS
    ssl_keyfile_path: Optional[str] = None
    ssl_certfile_path: Optional[str] = None


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

def get_settings():
    env = os.environ.get("ENVIRONMENT", "development")
    return GlobalSettings()

settings = get_settings()