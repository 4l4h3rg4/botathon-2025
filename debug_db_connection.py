import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

USER = os.getenv("SUPABASE_USER")
PASSWORD = os.getenv("SUPABASE_PASSWORD")
HOST = os.getenv("SUPABASE_HOST")
PORT = os.getenv("SUPABASE_PORT")
DB = os.getenv("SUPABASE_DB")

async def test_connect(user, port, desc, host_arg=None):
    target_host = host_arg if host_arg else HOST
    print(f"--- Testing {desc} ---")
    print(f"User: {user}")
    print(f"Host: {target_host}")
    print(f"Port: {port}")
    print(f"Password Length: {len(PASSWORD) if PASSWORD else 0}")
    try:
        # Try with server_settings for explicit project routing
        conn = await asyncpg.connect(
            user=user,
            password=PASSWORD,
            host=target_host,
            port=port,
            database=DB,
            ssl="require",
            server_settings={'project': 'mffriqwwojidkkbaulie'} if not host_arg else None
        )
        print("✅ Connection SUCCESS with server_settings!")
        await conn.close()
        return
    except Exception as e:
        print(f"⚠️ Connection with server_settings FAILED: {e}")

    try:
        # Fallback to standard connection
        conn = await asyncpg.connect(
            user=user,
            password=PASSWORD,
            host=target_host,
            port=port,
            database=DB,
            ssl="require"
        )
        print("✅ Connection SUCCESS!")
        await conn.close()
    except Exception as e:
        print(f"❌ Connection FAILED: {e}")

async def main():
    # Test 1: Current Config
    await test_connect(USER, PORT, "Current Configuration")

    # Test 2: Port 5432 (Session Mode) with same user
    await test_connect(USER, 5432, "Port 5432 (Session Mode)")

    # Test 3: User without project suffix (if applicable)
    if "." in USER:
        simple_user = USER.split(".")[0]
        await test_connect(simple_user, 6543, "Simple User (postgres) on Port 6543")
        await test_connect(simple_user, 5432, "Simple User (postgres) on Port 5432")

    # Test 4: Direct Connection (Bypassing Pooler)
    # Note: This often requires IPv6 support
    direct_host = "db.mffriqwwojidkkbaulie.supabase.co"
    await test_connect("postgres", 5432, f"Direct Connection to {direct_host}", host_arg=direct_host)

if __name__ == "__main__":
    asyncio.run(main())
