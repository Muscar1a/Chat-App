
import json
from fastapi import Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from api.deps import get_private_chat_manager, get_token_manager
from serializers.chat_serializers import message_serializer
from crud.chat import PrivateChatManager
from services.token import TokenManager
from schemas import shared
import schemas
import time
from collections import defaultdict, deque

connected_clients: dict[str, set] = dict()


# rate limit 
message_timestamps: dict[str, deque] = defaultdict(lambda: deque())

RATE_LIMIT = 5
INTERVAL = 1

async def chat_websocket_endpoint(
    chat_type: str,
    chat_id: str, 
    token: str,
    websocket: WebSocket,
    token_subject_key: str = 'id',
    token_manager: TokenManager = Depends(get_token_manager),
    pvt_chat_manager: PrivateChatManager = Depends(get_private_chat_manager),
):
    await websocket.accept()
    # print(f"[+] WebSocket connection accepted for chat type: {chat_type}, chat ID: {chat_id}")
    
    try:
       user_dict = await token_manager.get_user_form_jwt_token(token, token_subject_key)
       current_user = schemas.User(**user_dict)          
    except ValidationError:
        await websocket.send_json({"error": "Invalid user data"})
        await websocket.close()
        return
    except HTTPException:
        await websocket.send_json({"error": "Invalid token"})
        await websocket.close()
        return
    
    connected_clients.setdefault(chat_id, set()).add(websocket)
    print(f"[Connected Clients] {connected_clients}")
    
    try:
        while True:
            message = await websocket.receive_text()
            
            #  Rate limit check 
            now = time.time()
            timestamps = message_timestamps[current_user.id]
            timestamps.append(now)
            
            # Remove timestamps outside the rate limit interval
            while timestamps and now - timestamps[0] > INTERVAL:
                timestamps.popleft()
            if len(timestamps) > RATE_LIMIT:
                await websocket.send_json({"error": "Too many messages. Please wait."})
                continue
            #  ==========================
            
            # json_str = message.decode("utf-8")  # decode bytes -> string
            data = json.loads(message)
            # print(f"[--------] Received message: {data.keys()}")
            if chat_type == 'private':
                # print(f'[-] current_user: {current_user}')
                new_message = await pvt_chat_manager.create_message(
                    current_user.id, chat_id, 
                    data['message'], 
                    data['encrypted_key_sender'],
                    data['encrypted_key_receiver'],
                    data['iv'],
                )

            serialized_message = message_serializer(new_message.model_dump())
            # print("[Response Message]", serialized_message)
    
            for client_ws in connected_clients[chat_id]:
                print(f"client_ws: {client_ws}")
                await client_ws.send_json(serialized_message)
    
    except WebSocketDisconnect:
        print("[+] WebSocket connection closed")
        
    finally:
        print(f"Removed disconnected client websocket: {websocket} from the Chat id: {chat_id}")
        # remove clients
        connected_clients[chat_id].remove(websocket)
        
        if not connected_clients[chat_id]:
            del connected_clients[chat_id]
            print(f"[+] No more clients connected to chat ID: {chat_id}. Removed from connected_clients.")
        print("Finally remaining clints:", connected_clients)