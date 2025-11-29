import base64
import requests
from email.mime.text import MIMEText
from app.core.client import supabase

def get_email_config():
    """Fetch email config from Supabase."""
    response = supabase.table("configurations").select("*").in_("key", ["gmail_email", "gmail_token"]).execute()
    config = {item["key"]: item["value"] for item in response.data}
    return config

def send_email(to_email, subject, body):
    """Send email using Gmail API."""
    config = get_email_config()
    sender_email = config.get("gmail_email")
    access_token = config.get("gmail_token")
    
    if not sender_email or not access_token:
        raise ValueError("Gmail configuration missing (email or token).")

    # Create MIME Message
    message = MIMEText(body)
    message["to"] = to_email
    message["from"] = sender_email
    message["subject"] = subject
    
    # Encode as base64url
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    
    # Send via Gmail API
    url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {"raw": raw_message}
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"Gmail API Error: {response.text}")
        
    return response.json()
