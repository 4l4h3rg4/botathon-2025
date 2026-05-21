import requests
import json
import random

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_auth():
    email = f"test_user_{random.randint(1000, 9999)}@example.com"
    password = "securepassword123"
    
    print(f"Testing Auth with {email}...")
    
    # 1. Register
    print("\n1. Registering...")
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test User",
        "role": "admin"
    }
    session = requests.Session()
    resp = session.post(f"{BASE_URL}/register", json=payload)
    if resp.status_code != 201:
        print(f"Register failed: {resp.status_code} - {resp.text}")
        return
    user = resp.json()
    assert user["role"] == "worker"
    print("Register successful:", user)
    
    # 2. Login
    print("\n2. Logging in...")
    login_payload = {
        "email": email,
        "password": password
    }
    resp = session.post(f"{BASE_URL}/login", json=login_payload)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} - {resp.text}")
        return
        
    data = resp.json()
    print("Login successful!")
    print("Auth cookies set:", "auth_token" in session.cookies, "refresh_token" in session.cookies)
    
    # 3. Refresh
    print("\n3. Refreshing token...")
    resp = session.post(f"{BASE_URL}/refresh", json={})
    if resp.status_code != 200:
        print(f"Refresh failed: {resp.status_code} - {resp.text}")
        return
        
    print("Refresh successful!")
    print("Auth cookie refreshed:", "auth_token" in session.cookies)
    
    print("\nSUCCESS: Auth flow verified!")

if __name__ == "__main__":
    test_auth()
