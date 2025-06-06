from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIWebSocketRoute

from api.routers import users, auth, chat
# from websocket.wsocket import chat_websocket_endpoint
from database import db_connection_status, startup_db_client, shutdown_db_client
from motor.motor_asyncio import AsyncIOMotorDatabase

import socketio
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

# Register the startup event handler
@app.on_event('startup')
async def startup_event():
    await startup_db_client(app)
    db: AsyncIOMotorDatabase = app.mongodb
    await db["password_reset_tokens"].create_index(
        "expires_at",
        expireAfterSeconds=0
    )
    await db_connection_status()


# Register the shutdown event handler
@app.on_event('shutdown')
async def shutdown_event():
    await shutdown_db_client(app)
    


#   CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# #   API ROUTERS
app.include_router(auth.router)
app.include_router(users.router)
# app.include_router(chat.router)



# websocket = APIWebSocketRoute("/ws/chat/{chat_type}/{chat_id}", chat_websocket_endpoint)

# app.router.routes.append(websocket)