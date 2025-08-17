from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .services import guesthouse_service, booking_service, export_bookings_to_sqlite
from .auth import login as auth_login, admin_required, user_required
from .utils import parse_date_string, format_date_obj # For date validation if needed

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/login', methods=['POST'])
def login_route():
    return auth_login()

@api_bp.route('/guesthouses', methods=['GET'])
@jwt_required() # All logged-in users can see guesthouses
def get_guesthouses():
    guesthouses = guesthouse_service.get_all_guesthouses()
    return jsonify(guesthouses), 200

@api_bp.route('/bookings/request', methods=['POST'])
@user_required # Any logged in user can request
def request_booking():
    data = request.get_json()
    current_user = get_jwt_identity()
    
    guesthouse_id = data.get('guesthouse_id')
    start_date_str = data.get('start_date') # Expecting "DD-MM-YYYY"
    end_date_str = data.get('end_date')     # Expecting "DD-MM-YYYY"

    if not all([guesthouse_id, start_date_str, end_date_str]):
        return jsonify({"msg": "Missing required fields: guesthouse_id, start_date, end_date"}), 400

    # Basic date validation
    start_dt = parse_date_string(start_date_str)
    end_dt = parse_date_string(end_date_str)

    if not start_dt or not end_dt:
        return jsonify({"msg": "Invalid date format. Use DD-MM-YYYY"}), 400
    if start_dt > end_dt:
        return jsonify({"msg": "Start date cannot be after end date."}), 400

    booking_id, message = booking_service.create_booking_request(
        guesthouse_id, current_user, start_date_str, end_date_str
    )
    if booking_id:
        return jsonify({"msg": message, "booking_id": booking_id}), 201
    else:
        return jsonify({"msg": message}), 409 # 409 Conflict if not available

@api_bp.route('/bookings/my', methods=['GET'])
@user_required
def get_my_bookings():
    current_user = get_jwt_identity()
    bookings = booking_service.get_user_bookings(current_user)
    return jsonify(bookings), 200

@api_bp.route('/bookings/cancel/<booking_id>', methods=['POST']) # POST or PUT/PATCH
@user_required
def cancel_my_booking(booking_id):
    current_user = get_jwt_identity()
    success, message = booking_service.cancel_booking(booking_id, current_user)
    if success:
        return jsonify({"msg": message}), 200
    else:
        return jsonify({"msg": message}), 400 # Or 403 if permission issue, 404 if not found

# --- Admin Routes ---
@api_bp.route('/admin/bookings/all', methods=['GET'])
@admin_required
def get_all_bookings_admin():
    bookings = booking_service.get_all_bookings()
    return jsonify(bookings), 200

@api_bp.route('/admin/bookings/pending', methods=['GET'])
@admin_required
def get_pending_bookings_admin():
    bookings = booking_service.get_pending_bookings()
    return jsonify(bookings), 200

@api_bp.route('/admin/bookings/approve/<booking_id>', methods=['POST'])
@admin_required
def approve_booking_admin(booking_id):
    current_admin = get_jwt_identity() # For logging if needed
    success, message = booking_service.update_booking_status(booking_id, 'confirmed', current_admin)
    if success:
        # After successful approval, consider re-exporting to SQLite or make it a separate action
        # export_bookings_to_sqlite()
        return jsonify({"msg": message}), 200
    else:
        return jsonify({"msg": message}), 400

@api_bp.route('/admin/bookings/reject/<booking_id>', methods=['POST'])
@admin_required
def reject_booking_admin(booking_id):
    current_admin = get_jwt_identity()
    success, message = booking_service.update_booking_status(booking_id, 'rejected', current_admin) # 'rejected' or 'cancelled'
    if success:
        # export_bookings_to_sqlite()
        return jsonify({"msg": message}), 200
    else:
        return jsonify({"msg": message}), 400

@api_bp.route('/admin/export-db', methods=['POST']) # Could be GET if no body needed
@admin_required
def export_db_route():
    booking_service._load_bookings() # Ensure latest bookings are loaded from CSV before export
    success, message = export_bookings_to_sqlite()
    if success:
        return jsonify({"msg": message}), 200
    else:
        return jsonify({"msg": message}), 500

# Health check endpoint
@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200