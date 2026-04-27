import os
from flask import Flask
from flask_cors import CORS
from app.core.config import settings
from app.api.v1.router import api_bp

def create_app():
    app = Flask(settings.PROJECT_NAME)

    # Enable CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})
    
    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix=settings.API_V1_STR)
    
    @app.route("/health")
    def health_check():
        return {"status": "ok"}
        
    return app

flask_app = create_app()
app = flask_app  # alias for gunicorn (CMD: app.main:app)
from asgiref.wsgi import WsgiToAsgi
asgi_app = WsgiToAsgi(flask_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:asgi_app", host="0.0.0.0", port=8000, reload=True)
