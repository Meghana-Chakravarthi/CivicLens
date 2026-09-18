from flask import Blueprint, render_template


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["GET"])
def login():
    return render_template("login.html")


@auth_bp.route("/register", methods=["GET"])
def register():
    return render_template("register.html")
