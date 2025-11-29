from flask import Blueprint
from app.api.v1.endpoints import tasks, bots, volunteers, metrics, segmentation, communications, logs

api_bp = Blueprint('api_v1', __name__)

api_bp.register_blueprint(tasks.tasks_bp, url_prefix='/tasks')
api_bp.register_blueprint(bots.bots_bp, url_prefix='/bots')
api_bp.register_blueprint(volunteers.volunteers_bp, url_prefix='/voluntarios')
api_bp.register_blueprint(metrics.metrics_bp, url_prefix='/metrics')
api_bp.register_blueprint(segmentation.segmentation_bp, url_prefix='/segmentation')
api_bp.register_blueprint(communications.communications_bp, url_prefix='/communications')
api_bp.register_blueprint(logs.logs_bp, url_prefix='/logs')
