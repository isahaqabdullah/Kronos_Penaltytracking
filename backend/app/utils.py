import os
import logging
from datetime import datetime, timezone

# Directory to store exported session JSONs (if needed)
SESSION_EXPORT_DIR = os.environ.get("SESSION_EXPORT_DIR", "session_exports")
os.makedirs(SESSION_EXPORT_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Utility Functions ---

def safe_filename(name: str) -> str:
    """
    Sanitize a string to be filesystem-safe.
    Replaces all non-alphanumeric characters with underscores.
    """
    return "".join(c if c.isalnum() or c in ("_", "-") else "_" for c in name)

def timestamp_now(fmt: str = "%Y%m%d_%H%M%S") -> str:
    """
    Return a UTC timestamp string for filenames or logs.
    Default format: YYYYMMDD_HHMMSS
    """
    return datetime.utcnow().strftime(fmt)

def utc_now() -> datetime:
    """
    Return current UTC datetime with timezone info.
    """
    return datetime.now(timezone.utc)

def export_session_data(session_name: str, data: dict) -> str:
    """
    Export session data to a JSON file in SESSION_EXPORT_DIR.
    Returns the path of the saved file.
    """
    import json
    filename = f"{safe_filename(session_name)}_{timestamp_now()}.json"
    path = os.path.join(SESSION_EXPORT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    logger.info(f"Session data exported to {path}")
    return path

def load_session_data(file_path: str) -> dict:
    """
    Load session data from a JSON file.
    """
    import json
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Session file '{file_path}' does not exist.")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)
