import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from .base import Base
from dotenv import load_dotenv
from .models import Base, SessionInfo

def init_db():
    """Initialize control DB tables if they don’t exist."""
    from sqlalchemy import create_engine
    engine = _control_engine
    Base.metadata.create_all(bind=engine)

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Control DB (tracks all sessions) ---
CONTROL_DB_URL = os.getenv("DATABASE_URL")
if not CONTROL_DB_URL:
    raise ValueError("❌ DATABASE_URL not found in environment variables.")

# Engines and session factories
_control_engine = create_engine(CONTROL_DB_URL, pool_pre_ping=True)
ControlSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_control_engine)

# Global pointers to active session DB
_active_engine = _control_engine
ActiveSessionLocal = ControlSessionLocal

# --- Database Access ---
def get_db():
    """Return a session bound to the current active DB."""
    db = ActiveSessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Session Management ---
def switch_session_db(session_name: str):
    """
    Switch the active engine to a specific session database.
    Raises ValueError if DB does not exist.
    """
    global _active_engine, ActiveSessionLocal

    session_db_name = f"{session_name.lower().replace(' ', '_')}_db"
    base_url = CONTROL_DB_URL.rsplit("/", 1)[0]
    session_db_url = f"{base_url}/{session_db_name}"

    # Check if the session DB exists
    with _control_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname=:name;"),
            {"name": session_db_name}
        ).fetchone()
        if not exists:
            raise ValueError(f"Session database '{session_db_name}' does not exist")

    # Switch active engine & session factory
    _active_engine = create_engine(session_db_url, pool_pre_ping=True)
    ActiveSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_active_engine)
    logger.info(f"Switched active DB to session '{session_name}'")

def create_session_db(session_name: str):
    """
    Create a new database for a session and initialize tables.
    Raises Exception if DB already exists.
    """
    session_db_name = f"{session_name.lower().replace(' ', '_')}_db"

    # --- Connect to control DB with AUTOCOMMIT for CREATE DATABASE ---
    with _control_engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        # Check if the session DB already exists
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname=:name;"),
            {"name": session_db_name}
        ).fetchone()
        if exists:
            raise ValueError(f"Session database '{session_db_name}' already exists")

        # Create the new session database
        conn.execute(text(f"CREATE DATABASE {session_db_name};"))

    # --- Initialize tables in the new session DB ---
    session_db_url = f"{CONTROL_DB_URL.rsplit('/', 1)[0]}/{session_db_name}"
    engine = create_engine(session_db_url, pool_pre_ping=True)

    from .models import Infringement, InfringementHistory  # per-session models
    Base.metadata.create_all(bind=engine)

    logger.info(f"Session database '{session_db_name}' created and tables initialized.")



# --- Initialize Control DB Tables ---
def init_control_db():
    """
    Initializes tables in the control database (sessions table).
    """
    from .models import SessionInfo  # Only control DB model
    Base.metadata.create_all(bind=_control_engine)
    logger.info("Control database tables initialized.")
