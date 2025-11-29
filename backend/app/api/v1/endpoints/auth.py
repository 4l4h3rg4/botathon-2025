from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from pydantic import ValidationError

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        user_in = UserCreate(**data)
        
        # Check if user exists
        existing = supabase.table("users").select("id").eq("email", user_in.email).execute()
        if existing.data:
            return jsonify({"error": "Email already registered"}), 400
            
        # Hash password
        hashed_pw = get_password_hash(user_in.password)
        
        # Create user
        user_data = {
            "email": user_in.email,
            "password_hash": hashed_pw,
            "full_name": user_in.full_name,
            "role": user_in.role
        }
        
        response = supabase.table("users").insert(user_data).execute()
        
        if not response.data:
            return jsonify({"error": "Failed to create user"}), 500
            
        new_user = response.data[0]
        return jsonify(UserResponse(**new_user).model_dump()), 201
        
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 422
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        login_in = UserLogin(**data)
        
        # Get user
        response = supabase.table("users").select("*").eq("email", login_in.email).execute()
        if not response.data:
            return jsonify({"error": "Invalid credentials"}), 401
            
        user = response.data[0]
        
        # Verify password
        if not verify_password(login_in.password, user["password_hash"]):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Create tokens
        access_token = create_access_token(data={"sub": user["email"], "role": user["role"], "id": user["id"]})
        refresh_token = create_refresh_token(data={"sub": user["email"], "role": user["role"], "id": user["id"]})
        
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        })
        
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 422
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    try:
        data = request.get_json()
        refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            return jsonify({"error": "Missing refresh token"}), 400
            
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return jsonify({"error": "Invalid refresh token"}), 401
            
        # Create new access token
        # We could verify if user still exists here
        new_access_token = create_access_token(data={"sub": payload["sub"], "role": payload["role"], "id": payload["id"]})
        
        return jsonify({
            "access_token": new_access_token,
            "token_type": "bearer"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400
