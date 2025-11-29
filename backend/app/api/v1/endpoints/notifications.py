from flask import Blueprint, request, jsonify
from app.core.client import supabase

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("/", methods=["GET"])
def get_notifications():
    """Get all notifications, ordered by created_at desc."""
    try:
        # In a real app, filter by user_id from JWT
        response = supabase.table("notifications").select("*").order("created_at", desc=True).limit(20).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notifications_bp.route("/<uuid:notification_id>/read", methods=["PATCH"])
def mark_as_read(notification_id):
    """Mark a notification as read."""
    try:
        response = supabase.table("notifications").update({"read": True}).eq("id", str(notification_id)).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@notifications_bp.route("/mark-all-read", methods=["POST"])
def mark_all_read():
    """Mark all notifications as read."""
    try:
        # In a real app, filter by user_id
        response = supabase.table("notifications").update({"read": True}).neq("read", True).execute()
        return jsonify({"message": "All marked as read"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
