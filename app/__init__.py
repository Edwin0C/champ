from flask import Flask
from app.extensions import db, login_manager

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-prod' # Change for production
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///investment_sim.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)

    # Register Blueprints
    from app.routes_auth import auth_bp
    from app.routes_client import client_bp
    from app.routes_admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(client_bp)
    app.register_blueprint(admin_bp)

    return app
