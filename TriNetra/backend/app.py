from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import sys

# Windows consoles default to a codepage (e.g. cp1252) that can't encode the
# emoji used in this app's log messages, which crashes every print() call.
# Force UTF-8 stdout/stderr so startup and request logging never crash.
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

from config import Config
from api.chronos_api import chronos_bp
from api.hydra_api import hydra_bp
from api.autosar_api import autosar_bp
from api.ai_api import ai_bp
from data.synthetic_generator import init_database

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(chronos_bp, url_prefix='/api/chronos')
    app.register_blueprint(hydra_bp, url_prefix='/api/hydra')
    app.register_blueprint(autosar_bp, url_prefix='/api/autosar')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    
    # Serve frontend static files
    @app.route('/')
    def serve_frontend():
        return send_from_directory('../frontend', 'index.html')
    
    @app.route('/<path:filename>')
    def serve_static(filename):
        return send_from_directory('../frontend', filename)
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'TriNetra API'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Initialize database on first run
    init_database()
    
    print("🔹 TriNetra Backend Starting...")
    print(f"🔹 Server running at: http://localhost:{Config.PORT}")
    print("🔹 Press Ctrl+C to stop")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )