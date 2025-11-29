from flask import Blueprint
from app.api.v1.endpoints.volunteers import volunteers_bp
from app.api.v1.endpoints.metrics import metrics_bp
from app.api.v1.endpoints.segmentation import segmentation_bp
from app.api.v1.endpoints.communications import communications_bp
from app.api.v1.endpoints.tasks import tasks_bp
from app.api.v1.endpoints.logs import logs_bp
from app.api.v1.endpoints.bots import bots_bp
from app.api.v1.endpoints.auth import auth_bp
from app.api.v1.endpoints.config import config_bp
from app.api.v1.endpoints.notifications import notifications_bp

api_bp = Blueprint('api_v1', __name__)

api_bp.register_blueprint(tasks_bp, url_prefix='/tasks')
api_bp.register_blueprint(bots_bp, url_prefix='/bots')
api_bp.register_blueprint(volunteers_bp, url_prefix='/voluntarios')
api_bp.register_blueprint(metrics_bp, url_prefix='/metrics')
api_bp.register_blueprint(segmentation_bp, url_prefix='/segmentation')
api_bp.register_blueprint(communications_bp, url_prefix='/communications')
api_bp.register_blueprint(logs_bp, url_prefix='/logs')
api_bp.register_blueprint(auth_bp, url_prefix='/auth')
api_bp.register_blueprint(config_bp, url_prefix='/config')
api_bp.register_blueprint(notifications_bp, url_prefix='/notifications')
