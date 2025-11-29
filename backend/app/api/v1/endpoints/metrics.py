from flask import Blueprint, jsonify
from app.core.client import supabase

metrics_bp = Blueprint("metrics", __name__)

@metrics_bp.route("/overview", methods=["GET"])
def get_overview():
    """Get high-level metrics for the dashboard."""
    try:
        # Total Volunteers
        volunteers_response = supabase.table("volunteers").select("id", count="exact", head=True).execute()
        total_volunteers = volunteers_response.count

        # Active Campaigns (assuming we count all for now, or filter by status if added later)
        campaigns_response = supabase.table("campaigns").select("id", count="exact", head=True).execute()
        active_campaigns = campaigns_response.count

        # Messages Sent (from logs or a future messages table)
        # For now, using a placeholder or counting logs of type 'communication'
        # logs_response = supabase.table("logs").select("id", count="exact", head=True).eq("source", "communication").execute()
        messages_sent = 0 # logs_response.count

        return jsonify({
            "total_volunteers": total_volunteers,
            "active_campaigns": active_campaigns,
            "messages_sent": messages_sent,
            "avg_engagement": 85  # Placeholder
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@metrics_bp.route("/regions", methods=["GET"])
def get_regions():
    """Get volunteer distribution by region."""
    try:
        # Supabase doesn't support 'GROUP BY' easily in the JS/Python client without RPC.
        # Fetching all regions and aggregating in Python (efficient enough for hackathon size).
        response = supabase.table("volunteers").select("region").execute()
        data = response.data
        
        region_counts = {}
        for row in data:
            region = row.get("region") or "Unknown"
            region_counts[region] = region_counts.get(region, 0) + 1
            
        result = [{"region": k, "count": v} for k, v in region_counts.items()]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@metrics_bp.route("/skills", methods=["GET"])
def get_top_skills():
    """Get top skills among volunteers."""
    try:
        # Optimized approach: Fetch counts from volunteer_skills and names from skills
        # 1. Fetch all skill_ids from junction table
        vs_response = supabase.table("volunteer_skills").select("skill_id").execute()
        
        # 2. Count occurrences
        from collections import Counter
        skill_counts = Counter(row["skill_id"] for row in vs_response.data)
        
        if not skill_counts:
            return jsonify([])

        # 3. Fetch skill names for the top skills
        top_skill_ids = [s[0] for s in skill_counts.most_common(5)]
        
        # If no skills found, return empty
        if not top_skill_ids:
             return jsonify([])

        skills_response = supabase.table("skills").select("id, name").in_("id", top_skill_ids).execute()
        skill_map = {s["id"]: s["name"] for s in skills_response.data}
        
        # 4. Format result
        result = [
            {"skill": skill_map.get(skill_id, "Unknown"), "count": count}
            for skill_id, count in skill_counts.most_common(5)
            if skill_id in skill_map
        ]
        
        return jsonify(result)
    except Exception as e:
        # Fallback if volunteer_skills table is not accessible directly
        print(f"Error in optimized skills fetch: {e}")
        return jsonify({"error": str(e)}), 500

@metrics_bp.route("/timeline", methods=["GET"])
def get_timeline():
    """Get volunteer growth over time."""
    try:
        # Fetch creation dates
        response = supabase.table("volunteers").select("created_at").order("created_at").execute()
        data = response.data
        
        # Aggregate by month (simple string manipulation)
        timeline = {}
        for row in data:
            date_str = row["created_at"][:7] # YYYY-MM
            timeline[date_str] = timeline.get(date_str, 0) + 1
            
        result = [{"date": k, "count": v} for k, v in sorted(timeline.items())]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
