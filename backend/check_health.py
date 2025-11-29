import requests
import time
import sys

def wait_for_server(url, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"Server is up! Status: {response.status_code}")
                return True
        except requests.ConnectionError:
            time.sleep(1)
    print("Server timed out.")
    return False

if __name__ == "__main__":
    if wait_for_server("http://localhost:8000/health"):
        print("Health check passed.")
        # Try to hit an API endpoint
        try:
            resp = requests.get("http://localhost:8000/api/v1/metrics/overview")
            print(f"Metrics Endpoint: {resp.status_code}")
            print(resp.json())
        except Exception as e:
            print(f"Metrics check failed: {e}")
    else:
        sys.exit(1)
