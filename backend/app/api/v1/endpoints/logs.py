from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.schemas.log import LogCreate, LogResponse

logs_bp = Blueprint("logs", __name__)

@logs_bp.route("/", methods=["POST"])
def create_log():
    """Create a new system log."""
    try:
        data = request.get_json()
        log_in = LogCreate(**data)
        
        log_data = log_in.model_dump()
        # Ensure enums are serialized to strings if needed, Pydantic model_dump usually handles this if configured
        # But Supabase expects strings for enum columns usually.
        # Let's assume Pydantic handles it or we cast.
        log_data["source"] = log_data["source"].value if hasattr(log_data["source"], "value") else log_data["source"]
        log_data["level"] = log_data["level"].value if hasattr(log_data["level"], "value") else log_data["level"]
        
        response = supabase.table("logs").insert(log_data).execute()
        new_log = response.data[0]
        
        return jsonify(new_log), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@logs_bp.route("/", methods=["GET"])
def get_logs():
    """Get system logs with filtering."""
    try:
        limit = int(request.args.get("limit", 100))
        source = request.args.get("source")
        
        query = supabase.table("logs").select("*").order("created_at", desc=True).limit(limit)
        
        if source:
            query = query.eq("source", source)
            
        response = query.execute()
        logs = response.data
        
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
