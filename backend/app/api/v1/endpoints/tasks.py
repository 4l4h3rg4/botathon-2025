from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.schemas.task import TaskCreate, TaskResponse

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("/", methods=["POST"])
def create_task():
    """
    Create a new task.
    """
    try:
        data = request.get_json()
        task_in = TaskCreate(**data)
        
        task_data = {
            "payload": task_in.payload,
            "status": "pending" # Default status
        }
        
        response = supabase.table("tasks").insert(task_data).execute()
        new_task = response.data[0]
        
        return jsonify(new_task), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@tasks_bp.route("/<int:task_id>", methods=["GET"])
def get_task(task_id):
    """
    Get task status.
    """
    try:
        response = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
        task = response.data
        
        if not task:
            return jsonify({"error": "Task not found"}), 404
            
        return jsonify(task)
    except Exception as e:
        if "No rows found" in str(e):
             return jsonify({"error": "Task not found"}), 404
        return jsonify({"error": str(e)}), 500
