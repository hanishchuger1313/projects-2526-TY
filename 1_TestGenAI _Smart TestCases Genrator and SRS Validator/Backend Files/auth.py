import secrets
import re
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, field_validator
from passlib.context import CryptContext

from .database import users_col, sessions_col
from .config import settings

router = APIRouter()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

COOKIE_NAME = settings.cookie_name
SESSION_DAYS = settings.session_days

class Register(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    role: str

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < settings.min_password_length:
            raise ValueError(f"Password must be at least {settings.min_password_length} characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed_roles = ["student", "tester", "faculty"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v

class Login(BaseModel):
    email: EmailStr
    password: str

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

def _public_user(u: dict):
    return {
        "id": str(u["_id"]),
        "name": u.get("name", ""),
        "email": u.get("email", ""),
        "role": u.get("role", "student"),
        "createdAt": u.get("createdAt"),
        "lastLogin": u.get("lastLogin"),
        "isActive": u.get("isActive", True),
    }

def _norm_email(email: str) -> str:
    return (email or "").strip().lower()

def create_session(user_id: str, request: Request) -> str:
    sid = secrets.token_urlsafe(32)
    now = datetime.utcnow()
    expires = now + timedelta(days=SESSION_DAYS)

    sessions_col.insert_one({
        "_id": sid,
        "userId": user_id,
        "createdAt": now,
        "expiresAt": expires,
        "userAgent": request.headers.get("user-agent", ""),
        "ipAddress": request.client.host if request.client else "",
        "lastActivity": now
    })
    return sid

def refresh_session(sid: str):
    now = datetime.utcnow()
    expires = now + timedelta(days=SESSION_DAYS)
    sessions_col.update_one(
        {"_id": sid},
        {"$set": {"expiresAt": expires, "lastActivity": now}}
    )

def get_current_user(request: Request):
    sid = request.cookies.get(COOKIE_NAME)
    if not sid:
        raise HTTPException(status_code=401, detail="Not logged in")

    sess = sessions_col.find_one({"_id": sid})
    if not sess:
        raise HTTPException(status_code=401, detail="Session expired")

    if sess.get("expiresAt") and sess["expiresAt"] < datetime.utcnow():
        sessions_col.delete_one({"_id": sid})
        raise HTTPException(status_code=401, detail="Session expired")

    refresh_session(sid)

    user = users_col.find_one({"_id": ObjectId(sess["userId"])})
    if not user:
        sessions_col.delete_one({"_id": sid})
        raise HTTPException(status_code=401, detail="User not found")

    return _public_user(user)

@router.post("/register")
def register(data: Register, request: Request, response: Response):
    email = _norm_email(data.email)

    if users_col.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    user = {
        "name": data.fullName.strip(),
        "email": email,
        "password": pwd.hash(data.password),
        "role": data.role,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "isActive": True,
        "lastLogin": None
    }

    ins = users_col.insert_one(user)
    sid = create_session(str(ins.inserted_id), request)

    response.set_cookie(
        key=COOKIE_NAME,
        value=sid,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )

    return {"ok": True, "user": _public_user({**user, "_id": ins.inserted_id})}

@router.post("/login")
def login(data: Login, request: Request, response: Response):
    email = _norm_email(data.email)
    user = users_col.find_one({"email": email})

    if not user or not pwd.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("isActive", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

    sid = create_session(str(user["_id"]), request)

    response.set_cookie(
        key=COOKIE_NAME,
        value=sid,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )

    users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLogin": datetime.utcnow()}}
    )

    return {"ok": True, "user": {"name": user["name"], "role": user["role"], "email": user["email"]}}

@router.get("/me")
def me(request: Request):
    user = get_current_user(request)
    return {"ok": True, "user": user}

@router.post("/logout")
def logout(request: Request, response: Response):
    sid = request.cookies.get(COOKIE_NAME)
    if sid:
        sessions_col.delete_one({"_id": sid})
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}

@router.post("/change-password")
def change_password(data: ChangePassword, request: Request):
    user = get_current_user(request)

    db_user = users_col.find_one({"_id": ObjectId(user["id"])})
    if not db_user or not pwd.verify(data.current_password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(data.new_password) < settings.min_password_length:
        raise HTTPException(status_code=400, detail=f"New password must be at least {settings.min_password_length} characters")

    users_col.update_one(
        {"_id": ObjectId(user["id"])},
        {"$set": {"password": pwd.hash(data.new_password), "updatedAt": datetime.utcnow()}}
    )

    sessions_col.delete_many({
        "userId": user["id"],
        "_id": {"$ne": request.cookies.get(COOKIE_NAME)}
    })

    return {"ok": True, "message": "Password updated successfully"}

@router.get("/sessions")
def get_sessions(request: Request):
    user = get_current_user(request)

    sessions = list(sessions_col.find(
        {"userId": user["id"]},
        {"_id": 1, "createdAt": 1, "expiresAt": 1, "userAgent": 1, "ipAddress": 1}
    ).sort("createdAt", -1))

    for sess in sessions:
        sess["id"] = str(sess["_id"])
        sess.pop("_id", None)
        sess["isCurrent"] = sess["id"] == request.cookies.get(COOKIE_NAME)

    return {"ok": True, "sessions": sessions}

@router.delete("/sessions/{session_id}")
def revoke_session(session_id: str, request: Request):
    user = get_current_user(request)

    if session_id == request.cookies.get(COOKIE_NAME):
        raise HTTPException(status_code=400, detail="Cannot revoke current session from here. Use logout instead.")

    result = sessions_col.delete_one({"_id": session_id, "userId": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"ok": True, "message": "Session revoked"}
