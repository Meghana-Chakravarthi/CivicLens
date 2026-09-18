from .auth import auth_bp
from .citizen import citizen_bp
from .issues import issues_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(citizen_bp)
    app.register_blueprint(issues_bp)
