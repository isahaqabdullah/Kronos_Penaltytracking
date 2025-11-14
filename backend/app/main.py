from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .routes import session, infringements, penalties, history, infringement_log
from .ws_manager import manager
from .database import init_db, switch_session_db, ControlSessionLocal
from .models import SessionInfo
import logging

logger = logging.getLogger(__name__)

# --- Startup: Restore active session ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # --- Initialize control database ---
    # Only the control DB tracks session metadata
    init_db()
    
    # Restore active session if one exists
    try:
        db = ControlSessionLocal()
        try:
            active_session = db.query(SessionInfo).filter(SessionInfo.status == "active").first()
            if active_session:
                try:
                    switch_session_db(active_session.name)
                    logger.info(f"Restored active session: {active_session.name}")
                except Exception as e:
                    logger.warning(f"Could not restore active session '{active_session.name}': {e}")
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Error restoring active session on startup: {e}")
    
    yield
    # Shutdown (if needed)

# --- FastAPI app ---
app = FastAPI(title="Karting Infringement System", version="1.1", lifespan=lifespan)

# --- CORS Middleware ---
import os
cors_origins = os.getenv("CORS_ORIGINS", "*")
# Convert comma-separated string to list, or use ["*"] if "*" is specified
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include routers ---
app.include_router(session.router, prefix="/session")
app.include_router(infringements.router, prefix="/infringements")
app.include_router(penalties.router, prefix="/penalties")
app.include_router(history.router, prefix="/history")
app.include_router(infringement_log.router, prefix="/infringement_log")

# --- Health check endpoint ---
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# --- WebSocket endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for broadcasting events.
    Any connected client will receive broadcast messages from manager.
    """
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)

# --- Optional: auto-switch to default session on startup ---
# Uncomment if you want the app to automatically switch to a default session
# default_session = "default"
# try:
#     switch_session_db(default_session)
# except Exception as e:
#     import logging
#     logging.warning(f"Could not switch to default session: {e}")
