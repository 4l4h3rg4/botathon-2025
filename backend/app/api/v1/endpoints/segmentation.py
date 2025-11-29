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
        
        # Base query for fetching data
        query = supabase.table("volunteers").select("id, skills(name), campaigns(name), region, availability, volunteer_type, status")
        
        # Apply basic filters
        if "search" in filters and filters["search"]:
             query = query.or_(f"name.ilike.%{filters['search']}%,email.ilike.%{filters['search']}%")
        
        if "region" in filters and filters["region"] and filters["region"] != "all":
            query = query.eq("region", filters["region"])
            
        if "availability" in filters and filters["availability"]:
            query = query.eq("availability", filters["availability"])
            
        if "volunteer_type" in filters and filters["volunteer_type"]:
            query = query.eq("volunteer_type", filters["volunteer_type"])
            
        if "status" in filters and filters["status"]:
            query = query.eq("status", filters["status"])

        # Execute query to get candidates
        response = query.execute()
        candidates = response.data
        
        # Apply complex filters in Python (Skills, Campaigns)
        filtered_data = []
        for volunteer in candidates:
            match = True
            
            # Filter by skills
            if "skills" in filters and filters["skills"]:
                v_skills = [s["name"] for s in volunteer.get("skills", [])]
                if not all(skill in v_skills for skill in filters["skills"]):
                    match = False
            
            # Filter by campaign
            if match and "campaign" in filters and filters["campaign"] and filters["campaign"] != "all":
                v_campaigns = [c["name"] for c in volunteer.get("campaigns", [])]
                if filters["campaign"] not in v_campaigns:
                    match = False
            
            if match:
                filtered_data.append(volunteer)
                
        count = len(filtered_data)
        
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

@segmentation_bp.route("/", methods=["GET"])
def list_segments():
    """List all segments."""
    try:
        response = supabase.table("segments").select("*").order("created_at", desc=True).execute()
        return jsonify(response.data)
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
