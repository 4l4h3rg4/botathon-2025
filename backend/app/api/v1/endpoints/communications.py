from flask import Blueprint, request, jsonify, Response
from app.core.client import supabase
import csv
import io

communications_bp = Blueprint("communications", __name__)

def apply_filters(query, filters):
    """Helper to apply filters to a Supabase query."""
    if not filters:
        return query
    
    if "search" in filters and filters["search"]:
        query = query.or_(f"full_name.ilike.%{filters['search']}%,email.ilike.%{filters['search']}%")
    
    # Add other filters as needed
    return query

@communications_bp.route("/simular", methods=["POST"])
def simulate_communication():
    """
    Preview communication for a segment.
    Body: { "segment_id": "...", "template": "Hello {{name}}..." }
    """
    try:
        data = request.json
        segment_id = data.get("segment_id")
        template = data.get("template")
        
        # Get Segment
        seg_response = supabase.table("segments").select("*").eq("id", segment_id).single().execute()
        segment = seg_response.data
        
        if not segment:
            return jsonify({"error": "Segment not found"}), 404
            
        # Get Volunteers (Preview 5)
        query = supabase.table("volunteers").select("*")
        query = apply_filters(query, segment.get("filters"))
        query = query.limit(5)
        
        vol_response = query.execute()
        volunteers = vol_response.data
        
        previews = []
        for v in volunteers:
            # Note: 'full_name' is the column, but template might expect 'nombre'
            name = v.get("full_name", "Volunteer")
            email = v.get("email", "")
            region = v.get("region", "")
            
            msg = template.replace("{{nombre}}", name)\
                          .replace("{{email}}", email)\
                          .replace("{{region}}", region)
            previews.append({
                "volunteer": name,
                "email": email,
                "message": msg
            })
            
        return jsonify(previews)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@communications_bp.route("/<int:segment_id>/generar-csv", methods=["GET"])
def generate_csv(segment_id):
    try:
        template = request.args.get("template", "")
        
        # Get Segment
        seg_response = supabase.table("segments").select("*").eq("id", segment_id).single().execute()
        segment = seg_response.data
        
        if not segment:
            return jsonify({"error": "Segment not found"}), 404
            
        # Get Volunteers (All)
        query = supabase.table("volunteers").select("*")
        query = apply_filters(query, segment.get("filters"))
        # Note: Supabase default limit is 1000. For 'all', we might need pagination or higher limit.
        # Setting a high limit for now.
        query = query.limit(10000) 
        
        vol_response = query.execute()
        volunteers = vol_response.data
        
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Region", "Message"])
        
        for v in volunteers:
            name = v.get("full_name", "Volunteer")
            email = v.get("email", "")
            region = v.get("region", "")
            
            msg = template.replace("{{nombre}}", name)\
                          .replace("{{email}}", email)\
                          .replace("{{region}}", region)
            writer.writerow([name, email, region, msg])
            
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=segment_{segment_id}.csv"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
