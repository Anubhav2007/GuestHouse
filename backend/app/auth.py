from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from .services import user_service

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = user_service.get_user(username)

    if user and user['password'] == password:
        additional_claims = {"role": user['role']}
        access_token = create_access_token(identity=username, additional_claims=additional_claims)
        return jsonify(access_token=access_token, username=user['username'], role=user['role']), 200
    
    return jsonify({"msg": "incorrect username or password"}), 401

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify(msg="Admins only!"), 403
        return fn(*args, **kwargs)
    return wrapper

def user_required(fn): # General user, can be admin too
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        # No specific role check beyond being logged in
        return fn(*args, **kwargs)
    return wrapper