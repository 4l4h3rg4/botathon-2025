from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.schemas.segment import SegmentCreate, SegmentResponse

segmentation_bp = Blueprint("segmentation", __name__)

@segmentation_bp.route("/", methods=["POST"])
def create_segment():
    """Create a new segment based on filters."""
    try:
        data = request.get_json()
        segment_in = SegmentCreate(**data)
        filters = segment_in.filters
        
        # Calculate count of volunteers matching filters
        query = supabase.table("volunteers").select("id", count="exact", head=True)
        
        # Apply filters (simplified mapping)
        if "search" in filters and filters["search"]:
             query = query.or_(f"full_name.ilike.%{filters['search']}%,email.ilike.%{filters['search']}%")
        
        # Note: Complex filtering (skills, campaigns) would need more logic here 
        # similar to what we did in volunteers endpoint or using RPCs.
        # For now, we'll trust the count from the basic query or implement basic filtering.
        
        response = query.execute()
        count = response.count
        
        # Create Segment
        new_segment_data = {
            "filters": filters,
            "count": count
        }
        
        insert_response = supabase.table("segments").insert(new_segment_data).execute()
        new_segment = insert_response.data[0]
        
        return jsonify(new_segment), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@segmentation_bp.route("/<int:segment_id>", methods=["GET"])
def get_segment(segment_id):
    """Get a segment by ID."""
    try:
        response = supabase.table("segments").select("*").eq("id", segment_id).single().execute()
        segment = response.data
        
        if not segment:
            return jsonify({"error": "Segment not found"}), 404
            
        return jsonify(segment)
    except Exception as e:
        if "No rows found" in str(e):
             return jsonify({"error": "Segment not found"}), 404
        return jsonify({"error": str(e)}), 500
