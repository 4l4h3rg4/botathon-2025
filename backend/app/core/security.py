from datetime import datetime, timedelta
from typing import Optional, Union
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

ALGORITHM = "HS256"
# We need a secret key. I'll add it to settings later or use a default for now.
SECRET_KEY = getattr(settings, "SECRET_KEY", "supersecretkey") 
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

def require_role(role: str):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return jsonify({"error": "Missing Authorization header"}), 401
            
            try:
                token_type, token = auth_header.split()
                if token_type.lower() != "bearer":
                    raise ValueError("Invalid token type")
            except ValueError:
                return jsonify({"error": "Invalid Authorization header format"}), 401
            
            payload = decode_token(token)
            if not payload:
                return jsonify({"error": "Invalid or expired token"}), 401
            
            if payload.get("type") != "access":
                return jsonify({"error": "Invalid token type"}), 401
                
            user_role = payload.get("role")
            if user_role != role and user_role != "admin": # Admin can access everything
                return jsonify({"error": "Insufficient permissions"}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
