from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole
from fastapi import APIRouter, WebSocket
from app.utils.security import get_current_user_websocket
from app import GIGA_KEY
from app.utils import prompts
from app.data.models import User
from app.utils.error import Error
import uuid
import json

router = APIRouter(prefix="/ai", tags=["AI"])

ca_bundle_file = r"app/russian_trusted_root_ca_pem.crt"

async def payloads(payload: str):
    if payload == "student":
        return Chat(
            messages=[
                Messages(
                    role=MessagesRole.SYSTEM,
                    content=prompts.prompts["student"]
                )
            ],
            temperature=0.8,
            max_tokens=10000,
        )
    if payload == "retraining":
        return Chat(
            messages=[
                Messages(
                    role=MessagesRole.SYSTEM,
                    content=prompts.prompts["retraining"]
                )
            ],
            temperature=0.4,
            max_tokens=10000,
        )
    if payload == "teacher":
        return Chat(
            messages=[
                Messages(
                    role=MessagesRole.SYSTEM,
                    content=prompts.prompts["teacher"]
                )
            ],
            temperature=0.6,
            max_tokens=10000,
        )
    if payload == "management":
        return Chat(
            messages=[
                Messages(
                    role=MessagesRole.SYSTEM,
                    content=prompts.prompts["management"]
                )
            ],
            temperature=0.2,
            max_tokens=10000,
        ) 
    
@router.websocket("/")
async def assistant(websocket: WebSocket) -> str:
    await websocket.accept()
    current_user = await get_current_user_websocket(websocket.query_params.get("Authorization"))
    while True:
        data = await websocket.receive_text()
        user = await User.find_one(User.id == current_user.id)
        if not user:
            raise Error.USER_NOT_FOUND
        
        payload = await payloads(user.role)
        with GigaChat(credentials=GIGA_KEY, ca_bundle_file=ca_bundle_file, verify_ssl_certs=False) as giga:
            payload.messages.append(Messages(role=MessagesRole.USER, content=data))
            response = giga.chat(payload)
            payload.messages.append(response.choices[0].message)
        await websocket.send_text(response.choices[0].message.content)
        
