from app.core.client import supabase
from app.core.security import get_password_hash
import sys

def create_admin(email, password):
    print(f"Creating admin user: {email}")
    
    # Check if exists
    res = supabase.table("users").select("id").eq("email", email).execute()
    if res.data:
        print("User already exists.")
        return

    hashed = get_password_hash(password)
    
    data = {
        "email": email,
        "password_hash": hashed,
        "full_name": "Admin User",
        "role": "admin"
    }
    
    res = supabase.table("users").insert(data).execute()
    if res.data:
        print("Admin user created successfully!")
    else:
        print("Failed to create user.")

if __name__ == "__main__":
    create_admin("admin@sadi.com", "admin123")
