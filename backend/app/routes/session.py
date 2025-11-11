from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import os, json

from ..database import (
    get_db,
    create_session_db,
    switch_session_db,
    ControlSessionLocal,
    _control_engine
)
from ..models import SessionInfo
from ..ws_manager import manager
from ..vars import SESSION_EXPORT_DIR

router = APIRouter()

os.makedirs(SESSION_EXPORT_DIR, exist_ok=True)


# -------------------------------------------------------------------
# Create a new session
# -------------------------------------------------------------------
@router.post("/start")
def start_session(name: str, background_tasks: BackgroundTasks = None):
    """
    Start a new session:
    - Create a per-session database
    - Close any previous active session
    - Add record to control DB and switch active DB
    """
    db = ControlSessionLocal()
    try:
        # --- Step 1: Create per-session DB ---
        try:
            create_session_db(name)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create session DB: {e}")

        # --- Step 2: Close all existing sessions ---
        db.query(SessionInfo).update({SessionInfo.status: "closed"})
        db.commit()

        # --- Step 3: Add new session record ---
        session_info = SessionInfo(name=name, started_at=datetime.utcnow(), status="active")
        db.add(session_info)
        db.commit()

        # --- Step 4: Switch to new session DB ---
        try:
            switch_session_db(name)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to switch to session DB: {e}")

        # --- Step 5: Broadcast update ---
        payload_msg = {"type": "session_started", "session": {"name": name}}
        if background_tasks:
            background_tasks.add_task(manager.broadcast, json.dumps(payload_msg))

        return {"status": "Session started", "session": {"name": name}}
    finally:
        db.close()


# -------------------------------------------------------------------
# Load existing session
# -------------------------------------------------------------------
@router.post("/load")
def load_session(name: str, background_tasks: BackgroundTasks = None):
    """
    Load an existing session:
    - Switch to the per-session DB
    - Mark it as active in control DB
    """
    db = ControlSessionLocal()
    try:
        # --- Step 1: Switch DB ---
        try:
            switch_session_db(name)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to switch session DB: {e}")

        # --- Step 2: Close existing sessions ---
        db.query(SessionInfo).update({SessionInfo.status: "closed"})
        db.commit()

        # --- Step 3: Mark loaded session as active ---
        session_info = db.query(SessionInfo).filter(SessionInfo.name == name).first()
        if not session_info:
            session_info = SessionInfo(name=name, started_at=datetime.utcnow(), status="active")
            db.add(session_info)
        else:
            session_info.status = "active"
        db.commit()

        # --- Step 4: Broadcast update ---
        payload_msg = {"type": "session_loaded", "session": {"name": name}}
        if background_tasks:
            background_tasks.add_task(manager.broadcast, json.dumps(payload_msg))

        return {"status": f"Session '{name}' loaded"}
    finally:
        db.close()


# -------------------------------------------------------------------
# Close active session
# -------------------------------------------------------------------
@router.post("/close")
def close_session(name: str, background_tasks: BackgroundTasks = None):
    """
    Close an active session:
    - Marks session as closed in the control DB.
    """
    db = ControlSessionLocal()
    try:
        db.query(SessionInfo).filter(SessionInfo.name == name).update({SessionInfo.status: "closed"})
        db.commit()

        payload_msg = {"type": "session_closed", "session": {"name": name}}
        if background_tasks:
            background_tasks.add_task(manager.broadcast, json.dumps(payload_msg))

        return {"status": f"Session '{name}' closed"}
    finally:
        db.close()


# -------------------------------------------------------------------
# List all sessions
# -------------------------------------------------------------------
@router.get("/")
def list_sessions():
    """
    Fetch all sessions from the control DB.
    """
    db = ControlSessionLocal()
    try:
        sessions = db.query(SessionInfo).order_by(SessionInfo.started_at.desc()).all()
        return {
            "sessions": [
                {
                    "name": s.name,
                    "status": s.status,
                    "started_at": s.started_at.isoformat() if s.started_at else None
                } for s in sessions
            ]
        }
    finally:
        db.close()


# -------------------------------------------------------------------
# Delete session (drops DB + removes record)
# -------------------------------------------------------------------
@router.delete("/delete")
def delete_session(name: str, background_tasks: BackgroundTasks = None):
    """
    Delete a session completely:
    - Drops the per-session database.
    - Removes its record from the control DB.
    """
    db = ControlSessionLocal()
    try:
        session_db_name = f"{name.lower().replace(' ', '_')}_db"

        # --- Step 1: Drop the session database ---
        try:
            with _control_engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
                exists = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname=:name;"),
                    {"name": session_db_name}
                ).fetchone()

                if not exists:
                    raise HTTPException(status_code=404, detail=f"Session database '{session_db_name}' not found.")

                conn.execute(
                    text("""
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = :name;
                    """),
                    {"name": session_db_name}
                )

                conn.execute(text(f'DROP DATABASE "{session_db_name}";'))
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete session DB: {e}")

        # --- Step 2: Remove record from control DB ---
        db.query(SessionInfo).filter(SessionInfo.name == name).delete()
        db.commit()

        # --- Step 3: Broadcast deletion ---
        payload_msg = {"type": "session_deleted", "session": {"name": name}}
        if background_tasks:
            background_tasks.add_task(manager.broadcast, json.dumps(payload_msg))

        return {"status": f"Session '{name}' deleted successfully."}
    finally:
        db.close()
