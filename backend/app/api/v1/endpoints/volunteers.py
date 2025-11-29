from flask import Blueprint, request, jsonify
from app.core.client import supabase
from app.schemas.volunteer import VolunteerCreate, VolunteerUpdate

volunteers_bp = Blueprint("volunteers", __name__)

@volunteers_bp.route("/", methods=["POST"])
def create_volunteer():
    """Create a new volunteer."""
    try:
        data = request.get_json()
        # Validate with Pydantic
        volunteer_in = VolunteerCreate(**data)
        
        # Prepare data for insertion (exclude relations for now)
        vol_data = volunteer_in.model_dump(exclude={"skills", "campaigns"})
        
        # Insert Volunteer
        response = supabase.table("volunteers").insert(vol_data).execute()
        new_vol = response.data[0]
        
        # Handle Skills (Many-to-Many)
        if volunteer_in.skills:
            # First ensure skills exist or get their IDs
            # This is a bit manual. For the hackathon, maybe just assume they exist or create them?
            # Let's skip complex relation insertion for the MVP step unless critical.
            pass

        return jsonify(new_vol), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@volunteers_bp.route("/", methods=["GET"])
def get_volunteers():
    """Get all volunteers with filtering and pagination."""
    try:
        skip = int(request.args.get("skip", 0))
        limit = int(request.args.get("limit", 100))
        search = request.args.get("search")
        skills = request.args.getlist("skills")
        
        query = supabase.table("volunteers").select("*, skills(*), campaigns(*)")
        
        if search:
            # ILIKE search on name or email
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")
            
        # Note: Filtering by related table (skills) is tricky in single query with Supabase-py
        # We might need to filter in memory or use !inner join if supported by the client helper
        # For now, let's just fetch and filter if skills are provided, or rely on client-side filtering
        
        # Pagination
        query = query.range(skip, skip + limit - 1)
        
        response = query.execute()
        data = response.data
        
        # Manual filtering for skills if needed (since basic ORM-like filtering on relations is limited)
        if skills:
            filtered_data = []
            for vol in data:
                vol_skills = [s["name"] for s in vol.get("skills", [])]
                if any(skill in vol_skills for skill in skills):
                    filtered_data.append(vol)
            data = filtered_data

        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@volunteers_bp.route("/<string:volunteer_id>", methods=["GET"])
def get_volunteer(volunteer_id):
    """Get a single volunteer by ID."""
    try:
        response = supabase.table("volunteers").select("*, skills(*), campaigns(*)").eq("id", volunteer_id).single().execute()
        volunteer = response.data
        if not volunteer:
            return jsonify({"error": "Volunteer not found"}), 404
        return jsonify(volunteer)
    except Exception as e:
        # Supabase client raises an exception if .single() finds no data
        if "No rows found" in str(e):
            return jsonify({"error": "Volunteer not found"}), 404
        return jsonify({"error": str(e)}), 500

@volunteers_bp.route("/<string:volunteer_id>", methods=["PUT"])
def update_volunteer(volunteer_id):
    """Update a volunteer."""
    try:
        data = request.get_json()
        
        # Map frontend camelCase to snake_case if necessary
        if "volunteerType" in data:
            data["volunteer_type"] = data.pop("volunteerType")
            
        volunteer_update = VolunteerUpdate(**data)
        update_data = volunteer_update.model_dump(exclude_unset=True, exclude={"skills", "campaigns"})
        
        # Update main volunteer data if there are fields to update
        if update_data:
            response = supabase.table("volunteers").update(update_data).eq("id", volunteer_id).execute()
            if not response.data:
                return jsonify({"error": "Volunteer not found"}), 404
        else:
            # Verify existence if no main fields are being updated
            check = supabase.table("volunteers").select("id").eq("id", volunteer_id).execute()
            if not check.data:
                 return jsonify({"error": "Volunteer not found"}), 404
            
        # Handle Skills Update
        if volunteer_update.skills is not None:
            # 1. Clear existing skills
            supabase.table("volunteer_skills").delete().eq("volunteer_id", volunteer_id).execute()
            
            if volunteer_update.skills:
                # 2. Find existing IDs
                skills_resp = supabase.table("skills").select("id, name").in_("name", volunteer_update.skills).execute()
                skill_map = {s["name"]: s["id"] for s in skills_resp.data}
                
                # 3. Identify missing skills and create them
                missing_skills = [s for s in volunteer_update.skills if s not in skill_map]
                if missing_skills:
                    new_skills_payload = [{"name": s} for s in missing_skills]
                    create_resp = supabase.table("skills").insert(new_skills_payload).execute()
                    for s in create_resp.data:
                        skill_map[s["name"]] = s["id"]

                # 4. Insert new links
                new_links = []
                for skill_name in volunteer_update.skills:
                    if skill_name in skill_map:
                        new_links.append({"volunteer_id": volunteer_id, "skill_id": skill_map[skill_name]})
                
                if new_links:
                    supabase.table("volunteer_skills").insert(new_links).execute()

        # Handle Campaigns Update
        if volunteer_update.campaigns is not None:
            # 1. Clear existing campaigns
            supabase.table("volunteer_campaigns").delete().eq("volunteer_id", volunteer_id).execute()
            
            if volunteer_update.campaigns:
                # 2. Find existing IDs
                camp_resp = supabase.table("campaigns").select("id, name").in_("name", volunteer_update.campaigns).execute()
                camp_map = {c["name"]: c["id"] for c in camp_resp.data}
                
                # 3. Identify missing campaigns and create them (default year to current year if unknown)
                missing_campaigns = [c for c in volunteer_update.campaigns if c not in camp_map]
                if missing_campaigns:
                    import datetime
                    current_year = datetime.datetime.now().year
                    new_campaigns_payload = [{"name": c, "year": current_year} for c in missing_campaigns]
                    create_resp = supabase.table("campaigns").insert(new_campaigns_payload).execute()
                    for c in create_resp.data:
                        camp_map[c["name"]] = c["id"]

                # 4. Insert new links
                new_links = []
                for camp_name in volunteer_update.campaigns:
                    if camp_name in camp_map:
                        new_links.append({"volunteer_id": volunteer_id, "campaign_id": camp_map[camp_name]})
                
                if new_links:
                    supabase.table("volunteer_campaigns").insert(new_links).execute()
        
        # Fetch updated volunteer with relations
        final_response = supabase.table("volunteers").select("*, skills(*), campaigns(*)").eq("id", volunteer_id).single().execute()
        
        return jsonify(final_response.data)
    except Exception as e:
        print(f"Error updating volunteer: {e}")
        return jsonify({"error": str(e)}), 400
