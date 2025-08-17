from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from .utils import BOOKINGS_FILE, DATABASE_FILE # For path reference

def create_app():
    app = Flask(__name__, instance_relative_config=True) # instance_relative_config=True for instance folder
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')) # Load .env from backend directory

    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-fallback-secret-key') # Use env var
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    
    # Ensure instance folder exists for SQLite DB
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass # Dectory already exists

    print(f"Instance path: {app.instance_path}")
    print(f"Bookings CSV path: {os.path.abspath(BOOKINGS_FILE)}")
    print(f"Database path: {os.path.abspath(DATABASE_FILE)}")


    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all origins for dev
    JWTManager(app)

    from .routes import api_bp
    app.register_blueprint(api_bp)
    
    from .services import init_bookings_csv
    with app.app_context(): # ensure bookings.csv is initialized if needed within app context
        init_bookings_csv()

    return app