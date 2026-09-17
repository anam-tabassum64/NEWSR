import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import jwt
import requests
from flask import current_app, g, jsonify, request
from flask_mail import Message
from werkzeug.security import check_password_hash, generate_password_hash

from config import JWT_EXPIRES_HOURS
from storage import storage


def validate_email(email):
    return bool(re.match(r"^[\w.\-+]+@[\w.\-]+\.\w{2,}$", (email or "").strip()))


def validate_password(password):
    password = password or ""
    checks = ((len(password) >= 8, "Password must be at least 8 characters"),
              (any(c.isupper() for c in password), "Password must contain an uppercase letter"),
              (any(c.islower() for c in password), "Password must contain a lowercase letter"),
              (any(c.isdigit() for c in password), "Password must contain a number"))
    for valid, message in checks:
        if not valid:
            return {"valid": False, "message": message}
    return {"valid": True, "message": "Password is strong"}


def _secret():
    return current_app.config["JWT_SECRET"]


def generate_token(email, expires_hours=JWT_EXPIRES_HOURS, purpose="session"):
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": email, "iat": now, "exp": now + timedelta(hours=expires_hours), "purpose": purpose},
        _secret(),
        algorithm="HS256",
    )


def verify_token(token, purpose="session"):
    if not token or storage.is_token_revoked(token):
        return None
    try:
        payload = jwt.decode(token, _secret(), algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None
    return payload.get("sub") if payload.get("purpose") == purpose else None


def require_auth(view):
    """Protect a route and expose the authenticated email on Flask's request context."""
    from functools import wraps

    @wraps(view)
    def protected_view(*args, **kwargs):
        authorization = request.headers.get("Authorization", "")
        token = authorization[7:] if authorization.startswith("Bearer ") else ""
        email = verify_token(token)
        if not email or not storage.get_user(email):
            return jsonify({"error": "Authentication required"}), 401
        g.current_user_email = email
        return view(*args, **kwargs)

    return protected_view


def _token_expiry(token):
    try:
        return float(jwt.decode(token, _secret(), algorithms=["HS256"], options={"verify_exp": False})["exp"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        return datetime.now(timezone.utc).timestamp()


def build_public_user(email):
    user = storage.get_user(email)
    if not user:
        return None
    return {"name": user["name"], "email": user["email"], "verified": user.get("verified", True),
            "created_at": user["created_at"], "preferences": user.get("preferences", {})}


def register_user(data, mail):
    data = data or {}
    name, email, password = (data.get("name") or "").strip(), (data.get("email") or "").strip().lower(), data.get("password") or ""
    if not name or not email or not password:
        return {"error": "Name, email, and password are required"}, 400
    if not validate_email(email):
        return {"error": "Enter a valid email address"}, 400
    validation = validate_password(password)
    if not validation["valid"]:
        return {"error": validation["message"]}, 400
    if storage.get_user(email):
        return {"error": "Email already registered"}, 409
    storage.create_user({"email": email, "name": name, "password_hash": generate_password_hash(password),
                         "verified": True, "created_at": datetime.now(timezone.utc).isoformat(),
                         "preferences": {"topics": [], "languages": [], "bookmarks": [], "click_history": []}})
    return {"message": "Account created successfully.", "email": email, "token": generate_token(email), "user": build_public_user(email)}, 201


def login_user(data):
    data = data or {}
    email, password = (data.get("email") or "").strip().lower(), data.get("password") or ""
    if not email or not password:
        return {"error": "Email and password are required"}, 400
    user = storage.get_user(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return {"error": "Invalid email or password"}, 401
    return {"token": generate_token(email), "user": build_public_user(email)}, 200


def login_with_google(data):
    """Verify the Google ID token server-side and create an account on first use."""
    credential = ((data or {}).get("credential") or "").strip()
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        return {"error": "Google sign-in is not configured"}, 503
    if not credential:
        return {"error": "Google credential is required"}, 400

    try:
        response = requests.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": credential}, timeout=6)
        claims = response.json() if response.ok else {}
    except requests.RequestException:
        return {"error": "Unable to verify Google sign-in. Please try again."}, 502

    if (claims.get("aud") != client_id or claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}
            or claims.get("email_verified") not in {"true", True} or not validate_email(claims.get("email"))):
        return {"error": "Google sign-in could not be verified"}, 401

    email = claims["email"].strip().lower()
    if not storage.get_user(email):
        storage.create_user({
            "email": email,
            "name": (claims.get("name") or email.split("@", 1)[0]).strip(),
            "password_hash": generate_password_hash(secrets.token_urlsafe(32)),
            "verified": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "preferences": {"topics": [], "languages": [], "bookmarks": [], "click_history": []},
        })
    return {"token": generate_token(email), "user": build_public_user(email)}, 200


def logout_user(token):
    if token:
        storage.revoke_token(token, _token_expiry(token))
    return {"message": "Signed out successfully"}, 200


def send_reset_email(mail, to_email, reset_link, name):
    if not current_app.config.get("MAIL_USERNAME"):
        print(f"DEV MODE reset link for {to_email}: {reset_link}")
        return
    message = Message(subject="NewsPulse - Reset your password", recipients=[to_email])
    message.body = f"Hi {name},\n\nOpen this link to reset your password: {reset_link}"
    try:
        mail.send(message)
    except Exception as error:
        print(f"Failed to send reset email to {to_email}: {error}")


def forgot_password(data, mail):
    email = ((data or {}).get("email") or "").strip().lower()
    user = storage.get_user(email)
    if user:
        token = generate_token(email, 1, "password_reset")
        send_reset_email(mail, email, f"http://localhost:5173/reset-password?token={token}", user["name"])
    return {"message": "If that email exists, a reset link has been sent"}, 200


def reset_password(data):
    data = data or {}
    email = verify_token((data.get("token") or "").strip(), "password_reset")
    password = data.get("new_password") or ""
    if not email:
        return {"error": "Invalid or expired reset link"}, 401
    validation = validate_password(password)
    if not validation["valid"]:
        return {"error": validation["message"]}, 400
    storage.update_user(email, {"password_hash": generate_password_hash(password)})
    return {"message": "Password reset successfully"}, 200


def get_current_user(token):
    email = verify_token(token)
    if not email or not storage.get_user(email):
        return {"error": "Invalid or expired session"}, 401
    return {"user": build_public_user(email)}, 200


def update_preferences(token, data):
    email = verify_token(token)
    if not email or not storage.get_user(email):
        return {"error": "Invalid or expired session"}, 401
    current = storage.get_user(email).setdefault("preferences", {})
    current.update(data or {})
    storage.update_user(email, {"preferences": current})
    return {"message": "Preferences updated", "preferences": current}, 200
