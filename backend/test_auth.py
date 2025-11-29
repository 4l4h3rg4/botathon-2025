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
    resp = requests.post(f"{BASE_URL}/register", json=payload)
    if resp.status_code != 201:
        print(f"Register failed: {resp.status_code} - {resp.text}")
        return
    print("Register successful:", resp.json())
    
    # 2. Login
    print("\n2. Logging in...")
    login_payload = {
        "email": email,
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/login", json=login_payload)
    if resp.status_code != 200:
        print(f"Login failed: {resp.status_code} - {resp.text}")
        return
        
    data = resp.json()
    print("Login successful!")
    print(f"Access Token: {data.get('access_token')[:20]}...")
    print(f"Refresh Token: {data.get('refresh_token')[:20]}...")
    
    # 3. Refresh
    print("\n3. Refreshing token...")
    refresh_payload = {
        "refresh_token": data.get("refresh_token")
    }
    resp = requests.post(f"{BASE_URL}/refresh", json=refresh_payload)
    if resp.status_code != 200:
        print(f"Refresh failed: {resp.status_code} - {resp.text}")
        return
        
    new_data = resp.json()
    print("Refresh successful!")
    print(f"New Access Token: {new_data.get('access_token')[:20]}...")
    
    print("\nSUCCESS: Auth flow verified!")

if __name__ == "__main__":
    test_auth()
