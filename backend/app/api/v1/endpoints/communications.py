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
        query = query.or_(f"name.ilike.%{filters['search']}%,email.ilike.%{filters['search']}%")
    
    if "region" in filters and filters["region"] and filters["region"] != "all":
        query = query.eq("region", filters["region"])
        
    if "availability" in filters and filters["availability"]:
        query = query.eq("availability", filters["availability"])
        
    if "volunteer_type" in filters and filters["volunteer_type"]:
        query = query.eq("volunteer_type", filters["volunteer_type"])
        
    if "status" in filters and filters["status"]:
        query = query.eq("status", filters["status"])

    # Note: Complex filters (skills/campaigns) are skipped here for simplicity in communications
    # as they require fetching relations and filtering in memory, which is expensive for bulk ops.
    # Ideally, we'd use the IDs stored in the segment if we stored them, or duplicate the logic.
    # For now, we rely on basic filters.
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
        # Frontend sends 'content', backend used to expect 'template'. Support both.
        template = data.get("template") or data.get("content")
        
        if not template:
            return jsonify({"error": "Template content is required"}), 400
        
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
            name = v.get("name", "Volunteer")
            email = v.get("email", "")
            region = v.get("region", "")
            availability = v.get("availability", "")
            
            msg = template.replace("{{nombre}}", name)\
                          .replace("{{email}}", email)\
                          .replace("{{region}}", region)\
                          .replace("{{disponibilidad}}", availability)
                          
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
        template = request.args.get("template", "") or request.args.get("content", "")
        
        # Get Segment
        seg_response = supabase.table("segments").select("*").eq("id", segment_id).single().execute()
        segment = seg_response.data
        
        if not segment:
            return jsonify({"error": "Segment not found"}), 404
            
        # Get Volunteers (All)
        query = supabase.table("volunteers").select("*")
        query = apply_filters(query, segment.get("filters"))
        query = query.limit(10000) 
        
        vol_response = query.execute()
        volunteers = vol_response.data
        
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Region", "Message"])
        
        for v in volunteers:
            name = v.get("name", "Volunteer")
            email = v.get("email", "")
            region = v.get("region", "")
            availability = v.get("availability", "")
            
            msg = template.replace("{{nombre}}", name)\
                          .replace("{{email}}", email)\
                          .replace("{{region}}", region)\
                          .replace("{{disponibilidad}}", availability)
            writer.writerow([name, email, region, msg])
            
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=segment_{segment_id}.csv"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from app.services.email_service import send_email

@communications_bp.route("/enviar", methods=["POST"])
def send_communications():
    """
    Send emails to a segment.
    Body: { "segment_id": "...", "template": "...", "subject": "..." }
    """
    try:
        data = request.json
        segment_id = data.get("segment_id")
        template = data.get("template") or data.get("content")
        subject = data.get("subject", "Comunicado Teletón")
        
        if not template:
            return jsonify({"error": "Template content is required"}), 400
        
        # Get Segment
        seg_response = supabase.table("segments").select("*").eq("id", segment_id).single().execute()
        segment = seg_response.data
        
        if not segment:
            return jsonify({"error": "Segment not found"}), 404
            
        # Get Volunteers
        query = supabase.table("volunteers").select("*")
        query = apply_filters(query, segment.get("filters"))
        query = query.limit(50)
        
        vol_response = query.execute()
        volunteers = vol_response.data
        
        sent_count = 0
        errors = []
        
        for v in volunteers:
            name = v.get("name", "Voluntario")
            email = v.get("email")
            region = v.get("region", "")
            availability = v.get("availability", "")
            
            if not email:
                continue
                
            msg_body = template.replace("{{nombre}}", name)\
                               .replace("{{email}}", email)\
                               .replace("{{region}}", region)\
                               .replace("{{disponibilidad}}", availability)
            
            try:
                send_email(email, subject, msg_body)
                sent_count += 1
            except Exception as e:
                errors.append(f"Failed to send to {email}: {str(e)}")
                
        # Log the bulk action
        supabase.table("logs").insert({
            "source": "BOT",
            "level": "INFO",
            "message": f"Sent {sent_count} emails to segment {segment_id}",
            "details": {"errors": errors}
        }).execute()
        
        return jsonify({
            "message": f"Enviados {sent_count} correos.",
            "errors": errors
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
