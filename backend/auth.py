# FILE: backend/auth.py
import re
import secrets
import time

from flask import current_app
from flask_mail import Message
from werkzeug.security import check_password_hash, generate_password_hash


users = {}
# users[email] = {
#   "email": str,
#   "name": str,
#   "password_hash": str,
#   "verified": bool,
#   "created_at": float,
#   "preferences": { "topics": [], "languages": [], "bookmarks": [] }
# }

tokens = {}
# tokens[token_string] = { "email": str, "expires_at": float }


def validate_email(email: str) -> bool:
    return bool(re.match(r"^[\w\.-]+@[\w\.-]+\.\w{2,}$", (email or "").strip()))


def validate_password(password: str) -> dict:
    password = password or ""

    if len(password) < 8:
        return {"valid": False, "message": "Password must be at least 8 characters"}
    if not any(character.isupper() for character in password):
        return {"valid": False, "message": "Password must contain an uppercase letter"}
    if not any(character.islower() for character in password):
        return {"valid": False, "message": "Password must contain a lowercase letter"}
    if not any(character.isdigit() for character in password):
        return {"valid": False, "message": "Password must contain a number"}

    return {"valid": True, "message": "Password is strong"}


def generate_token(email: str, expires_hours: int = 24) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = time.time() + expires_hours * 60 * 60
    tokens[token] = {"email": email, "expires_at": expires_at}
    return token


def verify_token(token: str):
    if not token:
        return None

    stored = tokens.get(token)
    if not stored:
        return None

    if time.time() > stored["expires_at"]:
        tokens.pop(token, None)
        return None

    return stored["email"]


def send_reset_email(mail, to_email: str, reset_link: str, name: str):
    if not current_app.config.get("MAIL_USERNAME"):
        print(f"DEV MODE reset link for {to_email}: {reset_link}")
        return

    msg = Message(
        subject="NewsPulse - Reset your password",
        recipients=[to_email],
    )
    msg.body = (
        f"Hi {name},\n\n"
        "You requested a password reset.\n\n"
        f"Open this link to continue: {reset_link}\n\n"
        "If you did not request this, ignore this email.\n\n"
        "- The NewsPulse Team"
    )
    msg.html = f"""
    <p>Hi {name},</p>
    <p>You requested a password reset.</p>
    <p><a href="{reset_link}">Reset your password</a></p>
    <p>If you did not request this, ignore this email.</p>
    <p>- The NewsPulse Team</p>
    """

    try:
        mail.send(msg)
    except Exception as error:
        print(f"Failed to send reset email to {to_email}: {error}")
        print(f"DEV MODE reset link for {to_email}: {reset_link}")


def build_public_user(email: str):
    user = users[email]
    return {
        "name": user["name"],
        "email": user["email"],
        "verified": user["verified"],
        "created_at": user["created_at"],
        "preferences": user.get(
            "preferences",
            {"topics": [], "languages": [], "bookmarks": [], "click_history": []},
        ),
    }


def register_user(data: dict, mail) -> tuple[dict, int]:
    data = data or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return {"error": "Name, email, and password are required"}, 400

    if not validate_email(email):
        return {"error": "Enter a valid email address"}, 400

    password_validation = validate_password(password)
    if not password_validation["valid"]:
        return {"error": password_validation["message"]}, 400

    if email in users:
        return {"error": "Email already registered"}, 409

    users[email] = {
        "email": email,
        "name": name,
        "password_hash": generate_password_hash(password),
        "verified": True,
        "created_at": time.time(),
        "preferences": {"topics": [], "languages": [], "bookmarks": [], "click_history": []},
    }
    token = generate_token(email)

    return {
        "message": "Account created successfully.",
        "email": email,
        "token": token,
        "user": build_public_user(email),
    }, 201


def login_user(data: dict) -> tuple[dict, int]:
    data = data or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return {"error": "Email and password are required"}, 400

    user = users.get(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return {"error": "Invalid email or password"}, 401

    user["verified"] = True
    token = generate_token(email)
    return {"token": token, "user": build_public_user(email)}, 200


def logout_user(token: str) -> tuple[dict, int]:
    if token:
        tokens.pop(token, None)
    return {"message": "Signed out successfully"}, 200


def forgot_password(data: dict, mail) -> tuple[dict, int]:
    data = data or {}
    email = (data.get("email") or "").strip().lower()

    if email in users:
        reset_token = generate_token(email, expires_hours=1)
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        send_reset_email(mail, email, reset_link, users[email]["name"])

    return {"message": "If that email exists, a reset link has been sent"}, 200


def reset_password(data: dict) -> tuple[dict, int]:
    data = data or {}
    token = (data.get("token") or "").strip()
    new_password = data.get("new_password") or ""

    if not token or not new_password:
        return {"error": "Token and new password are required"}, 400

    email = verify_token(token)
    if not email or email not in users:
        return {"error": "Invalid or expired reset link"}, 401

    password_validation = validate_password(new_password)
    if not password_validation["valid"]:
        return {"error": password_validation["message"]}, 400

    users[email]["password_hash"] = generate_password_hash(new_password)
    tokens.pop(token, None)
    return {"message": "Password reset successfully"}, 200


def get_current_user(token: str) -> tuple[dict, int]:
    email = verify_token(token)
    if not email or email not in users:
        return {"error": "Invalid or expired session"}, 401

    return {"user": build_public_user(email)}, 200


def update_preferences(token: str, data: dict) -> tuple[dict, int]:
    email = verify_token(token)
    if not email or email not in users:
        return {"error": "Invalid or expired session"}, 401

    data = data or {}
    current_preferences = users[email].setdefault(
        "preferences",
        {"topics": [], "languages": [], "bookmarks": [], "click_history": []},
    )
    current_preferences.update(data)

    return {
        "message": "Preferences updated",
        "preferences": current_preferences,
    }, 200
