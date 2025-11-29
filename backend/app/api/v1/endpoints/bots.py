from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.core.config import settings
from functools import wraps

bots_bp = Blueprint("bots", __name__)

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != settings.BLUE_PRISM_API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@bots_bp.route("/pending-tasks", methods=["GET"])
@require_api_key
def get_pending_tasks():
    """
    Get next pending task for a bot to process.
    This endpoint is designed for Blue Prism bots to poll.
    """
    try:
        # Find oldest pending task
        response = supabase.table("tasks")\
            .select("*")\
            .eq("status", "pending")\
            .order("created_at")\
            .limit(1)\
            .execute()
            
        tasks = response.data
        
        if not tasks:
            return jsonify({"message": "No pending tasks"}), 200
            
        task = tasks[0]
        
        # Lock task for this bot (optimistic locking or simple status update)
        # For simplicity, we just mark it as PROCESSING immediately
        update_data = {"status": "processing"}
        bot_id = request.headers.get("X-Bot-ID")
        if bot_id:
            update_data["bot_id"] = bot_id
            
        upd_response = supabase.table("tasks").update(update_data).eq("id", task["id"]).execute()
        updated_task = upd_response.data[0]
        
        return jsonify(updated_task)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bots_bp.route("/task/<int:task_id>/complete", methods=["POST"])
@require_api_key
def complete_task(task_id):
    """
    Mark a task as completed or failed.
    """
    try:
        data = request.json
        
        update_data = {}
        if "status" in data:
            update_data["status"] = data["status"]
        if "result" in data:
            update_data["result"] = data["result"]
        if "error_message" in data:
            update_data["error_message"] = data["error_message"]
            
        if not update_data:
             return jsonify({"error": "No data to update"}), 400

        response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        if not response.data:
            return jsonify({"error": "Task not found"}), 404
            
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
