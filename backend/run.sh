#!/bin/bash
# Run the backend with Gunicorn for stability
# This avoids the "CurrentThreadExecutor already quit" error seen with Uvicorn+Flask
python3 -m gunicorn -w 4 -b 0.0.0.0:8000 app.main:flask_app --access-logfile -
