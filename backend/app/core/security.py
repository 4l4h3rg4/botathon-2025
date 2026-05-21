from datetime import datetime, timedelta
from typing import Optional, Union
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

ALGORITHM = "HS256"
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

from functools import wraps
from flask import request, jsonify

AUTH_COOKIE_NAME = "auth_token"
REFRESH_COOKIE_NAME = "refresh_token"

def _get_bearer_token() -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            token_type, token = auth_header.split()
            if token_type.lower() != "bearer":
                raise ValueError("Invalid token type")
            return token
        except ValueError:
            return None

    return request.cookies.get(AUTH_COOKIE_NAME)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = _get_bearer_token()
        if not token:
            return jsonify({"error": "Missing Authorization token"}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        if payload.get("type") != "access":
            return jsonify({"error": "Invalid token type"}), 401

        return f(*args, **kwargs)
    return decorated_function

def require_role(role: Union[str, list[str], tuple[str, ...]]):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = _get_bearer_token()
            if not token:
                return jsonify({"error": "Missing Authorization token"}), 401
            
            payload = decode_token(token)
            if not payload:
                return jsonify({"error": "Invalid or expired token"}), 401
            
            if payload.get("type") != "access":
                return jsonify({"error": "Invalid token type"}), 401
                
            allowed_roles = {role} if isinstance(role, str) else set(role)
            user_role = payload.get("role")
            if user_role not in allowed_roles and user_role != "admin": # Admin can access everything
                return jsonify({"error": "Insufficient permissions"}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
