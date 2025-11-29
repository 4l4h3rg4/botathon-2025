from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.core.security import require_role

config_bp = Blueprint("config", __name__)

@config_bp.route("/", methods=["GET"])
@require_role("admin")
def get_config():
    """Get all system configurations."""
    try:
        response = supabase.table("configurations").select("*").execute()
        data = response.data
        
        # Convert list of kv pairs to a single dict
        config_dict = {item["key"]: item["value"] for item in data}
        return jsonify(config_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@config_bp.route("/", methods=["POST"])
@require_role("admin")
def update_config():
    """Update system configurations."""
    try:
        data = request.get_json()
        
        updated_configs = []
        for key, value in data.items():
            # Upsert each key-value pair
            response = supabase.table("configurations").upsert({
                "key": key,
                "value": str(value),
                "updated_at": "now()"
            }).execute()
            if response.data:
                updated_configs.append(response.data[0])
                
        return jsonify(updated_configs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
