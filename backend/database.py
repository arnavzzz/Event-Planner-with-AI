"""
SQLite3 Database layer for Event Planner.
Handles User accounts, Session management, and Event storage.
Initializes tables and seeds default user and 3 default profile events.
"""

import sqlite3
import hashlib
import os
import uuid
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any

# Store SQLite DB in the backend directory
DB_PATH = Path(__file__).resolve().parent / "event_planner.db"


def get_db_connection() -> sqlite3.Connection:
    """Creates a thread-safe connection to SQLite with row dictionary factory."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=30.0)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys, WAL mode for high concurrency, and busy timeout
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA busy_timeout = 30000")
    return conn


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hashes password with SHA-256 and a random or provided salt."""
    if not salt:
        salt = uuid.uuid4().hex[:16]
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifies plain password against stored salt$hash format."""
    try:
        salt, _ = stored_hash.split("$", 1)
        expected = hash_password(plain_password, salt)
        return expected == stored_hash
    except Exception:
        return False


def _date_from_today(days: int) -> str:
    target = datetime.now() + timedelta(days=days)
    return target.strftime("%Y-%m-%d")


def init_db():
    """Initializes SQLite database tables and default data."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'event-organizer',
            avatar_color TEXT DEFAULT '#1B2A4A',
            created_at TEXT NOT NULL
        )
    """)

    # 2. Sessions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # 3. Events Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            event_name TEXT NOT NULL,
            event_type TEXT NOT NULL,
            client_budget REAL NOT NULL,
            guest_count INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Upcoming',
            vendors_json TEXT,
            is_default INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    conn.commit()

    # Seed Default User if not present
    default_email = "eo1@arnav.com"
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (default_email,))
    user_row = cursor.fetchone()

    if not user_row:
        user_id = "USR-DEMO-001"
        pw_hash = hash_password("123456")
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, name, role, avatar_color, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            default_email,
            pw_hash,
            "Arnav Sharma",
            "event-organizer",
            "#1B2A4A",
            datetime.now().isoformat()
        ))
        conn.commit()
    else:
        user_id = user_row["id"]

    # Seed Default Three Events for the default user if none exist
    cursor.execute("SELECT COUNT(*) as count FROM events WHERE user_id = ?", (user_id,))
    event_count = cursor.fetchone()["count"]

    if event_count == 0:
        seed_default_three_events(user_id, cursor)
        conn.commit()

    conn.close()
    print(f"[SQLite DB] Initialized database at {DB_PATH.name} with default user and profile events.")


def seed_default_three_events(user_id: str, cursor: Optional[sqlite3.Cursor] = None):
    """Inserts the 3 default profile events for a user."""
    should_close = False
    if cursor is None:
        conn = get_db_connection()
        cursor = conn.cursor()
        should_close = True

    default_events = [
        {
            "id": f"EVT-DEF-001-{user_id[:8]}",
            "user_id": user_id,
            "event_name": "Spring Design Conference",
            "event_type": "Conference",
            "client_budget": 125000.0,
            "guest_count": 240,
            "start_date": _date_from_today(18),
            "end_date": _date_from_today(19),
            "status": "Upcoming",
            "is_default": 1,
            "vendors": [
                {"id": "vendor-catering", "name": "Northstar Catering", "category": "Catering", "service": "Buffet & Plated Menus", "estimatedCost": 42000},
                {"id": "vendor-av", "name": "Soundwave AV", "category": "Audio & Lighting", "service": "Sound, Stage & Lighting", "estimatedCost": 31000},
                {"id": "vendor-rentals", "name": "Gatherwell Rentals", "category": "Furniture & Rentals", "service": "Seating & Equipment", "estimatedCost": 19000}
            ]
        },
        {
            "id": f"EVT-DEF-002-{user_id[:8]}",
            "user_id": user_id,
            "event_name": "Maya & Rohan Royal Wedding",
            "event_type": "Wedding",
            "client_budget": 850000.0,
            "guest_count": 320,
            "start_date": _date_from_today(37),
            "end_date": _date_from_today(38),
            "status": "Upcoming",
            "is_default": 1,
            "vendors": [
                {"id": "vendor-catering", "name": "Northstar Catering", "category": "Catering", "service": "Royal Banquet Service", "estimatedCost": 320000},
                {"id": "vendor-decor", "name": "Evergreen Decor Studio", "category": "Decor", "service": "Mandap & Floral Styling", "estimatedCost": 240000},
                {"id": "vendor-photo", "name": "Frame & Focus", "category": "Photography", "service": "Cinematic 4K & Drone Coverage", "estimatedCost": 110000},
                {"id": "vendor-entertainment", "name": "Rhythm House", "category": "Entertainment", "service": "Live Sangeet Band & DJ", "estimatedCost": 95000}
            ]
        },
        {
            "id": f"EVT-DEF-003-{user_id[:8]}",
            "user_id": user_id,
            "event_name": "TechNext Product Launch",
            "event_type": "Corporate",
            "client_budget": 280000.0,
            "guest_count": 150,
            "start_date": _date_from_today(60),
            "end_date": _date_from_today(61),
            "status": "Upcoming",
            "is_default": 1,
            "vendors": [
                {"id": "vendor-av", "name": "Soundwave AV", "category": "Audio & Lighting", "service": "Keynote Stage & Video Walls", "estimatedCost": 98000},
                {"id": "vendor-decor", "name": "Evergreen Decor Studio", "category": "Decor", "service": "Futuristic Exhibition Booths", "estimatedCost": 72000},
                {"id": "vendor-photo", "name": "Frame & Focus", "category": "Photography", "service": "Press & Live Stream Coverage", "estimatedCost": 45000}
            ]
        }
    ]

    for ev in default_events:
        cursor.execute("""
            INSERT OR REPLACE INTO events (
                id, user_id, event_name, event_type, client_budget, guest_count,
                start_date, end_date, status, vendors_json, is_default, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ev["id"],
            ev["user_id"],
            ev["event_name"],
            ev["event_type"],
            ev["client_budget"],
            ev["guest_count"],
            ev["start_date"],
            ev["end_date"],
            ev["status"],
            json.dumps(ev["vendors"]),
            ev["is_default"],
            datetime.now().isoformat()
        ))

    if should_close:
        conn.commit()
        conn.close()


# -----------------------------------------------------------------------------
# User & Session Queries
# -----------------------------------------------------------------------------

def create_user(email: str, password: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Creates a new user and seeds their 3 default profile events."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    if cursor.fetchone():
        conn.close()
        raise ValueError("An account with this email address already exists.")

    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    display_name = name.strip() if name and name.strip() else email.split("@")[0].capitalize()
    pw_hash = hash_password(password)
    now_iso = datetime.now().isoformat()

    colors = ["#1B2A4A", "#3D6B4F", "#C1440E", "#2D5A87", "#5B3A82"]
    avatar_color = colors[len(email) % len(colors)]

    cursor.execute("""
        INSERT INTO users (id, email, password_hash, name, role, avatar_color, created_at)
        VALUES (?, ?, ?, ?, 'event-organizer', ?, ?)
    """, (user_id, email.strip().lower(), pw_hash, display_name, avatar_color, now_iso))

    # Seed 3 default profile events for this new user
    seed_default_three_events(user_id, cursor)

    conn.commit()
    conn.close()

    return {
        "id": user_id,
        "email": email.strip().lower(),
        "name": display_name,
        "role": "event-organizer",
        "avatar_color": avatar_color,
        "created_at": now_iso
    }


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Validates user credentials against SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, email, password_hash, name, role, avatar_color, created_at
        FROM users WHERE LOWER(email) = LOWER(?)
    """, (email.strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    if not verify_password(password, row["password_hash"]):
        return None

    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
        "avatar_color": row["avatar_color"],
        "created_at": row["created_at"]
    }


def create_session(user_id: str) -> str:
    """Generates a session token and stores it in SQLite."""
    token = f"sess_{uuid.uuid4().hex}_{uuid.uuid4().hex[:8]}"
    now = datetime.now()
    expires_at = (now + timedelta(days=7)).isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    """, (token, user_id, now.isoformat(), expires_at))
    conn.commit()
    conn.close()

    return token


def delete_session(token: str) -> bool:
    """Removes a session token from SQLite on Logout."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def get_user_by_session(token: str) -> Optional[Dict[str, Any]]:
    """Retrieves user profile using active session token."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.email, u.name, u.role, u.avatar_color, u.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
        "avatar_color": row["avatar_color"],
        "created_at": row["created_at"]
    }


# -----------------------------------------------------------------------------
# Event Queries
# -----------------------------------------------------------------------------

def get_events_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Returns all events belonging to a user, formatted for the frontend."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, event_name, event_type, client_budget, guest_count,
               start_date, end_date, status, vendors_json, is_default, created_at
        FROM events
        WHERE user_id = ?
        ORDER BY is_default DESC, start_date ASC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    events = []
    for r in rows:
        vendors = []
        if r["vendors_json"]:
            try:
                vendors = json.loads(r["vendors_json"])
            except Exception:
                vendors = []

        events.append({
            "id": r["id"],
            "eventName": r["event_name"],
            "eventType": r["event_type"],
            "clientBudget": r["client_budget"],
            "guestCount": r["guest_count"],
            "startDate": r["start_date"],
            "endDate": r["end_date"],
            "status": r["status"],
            "isDefault": bool(r["is_default"]),
            "vendors": vendors,
            "createdAt": r["created_at"]
        })
    return events


def get_default_profile_events(user_id: str) -> List[Dict[str, Any]]:
    """Returns specifically the default three events in profile for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, event_name, event_type, client_budget, guest_count,
               start_date, end_date, status, vendors_json, is_default, created_at
        FROM events
        WHERE user_id = ? AND is_default = 1
        ORDER BY start_date ASC
        LIMIT 3
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    events = []
    for r in rows:
        vendors = []
        if r["vendors_json"]:
            try:
                vendors = json.loads(r["vendors_json"])
            except Exception:
                vendors = []

        events.append({
            "id": r["id"],
            "eventName": r["event_name"],
            "eventType": r["event_type"],
            "clientBudget": r["client_budget"],
            "guestCount": r["guest_count"],
            "startDate": r["start_date"],
            "endDate": r["end_date"],
            "status": r["status"],
            "isDefault": True,
            "vendors": vendors,
            "createdAt": r["created_at"]
        })
    return events


def create_user_event(user_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new event associated with a user in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()

    event_id = event_data.get("id") or f"EVT-{int(datetime.now().timestamp() * 1000)}"
    vendors_json = json.dumps(event_data.get("vendors") or [])
    now_iso = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO events (
            id, user_id, event_name, event_type, client_budget, guest_count,
            start_date, end_date, status, vendors_json, is_default, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        event_id,
        user_id,
        event_data["eventName"],
        event_data["eventType"],
        float(event_data["clientBudget"]),
        int(event_data["guestCount"]),
        event_data["startDate"],
        event_data["endDate"],
        event_data.get("status", "Upcoming"),
        vendors_json,
        now_iso
    ))

    conn.commit()
    conn.close()

    return {
        "id": event_id,
        "eventName": event_data["eventName"],
        "eventType": event_data["eventType"],
        "clientBudget": float(event_data["clientBudget"]),
        "guestCount": int(event_data["guestCount"]),
        "startDate": event_data["startDate"],
        "endDate": event_data["endDate"],
        "status": event_data.get("status", "Upcoming"),
        "isDefault": False,
        "vendors": event_data.get("vendors") or [],
        "createdAt": now_iso
    }
