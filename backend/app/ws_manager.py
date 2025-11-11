# === FILE: app/ws_manager.py ===
import json
from typing import List
from fastapi import WebSocket
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            try:
                self.active_connections.remove(websocket)
            except ValueError:
                pass

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        # copy list under lock then send without holding the lock to avoid deadlocks
        async with self.lock:
            connections = list(self.active_connections)
        disconnected = []
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        if disconnected:
            async with self.lock:
                for d in disconnected:
                    try:
                        self.active_connections.remove(d)
                    except ValueError:
                        pass


manager = ConnectionManager()
