from flask import Blueprint, render_template


citizen_bp = Blueprint("citizen", __name__, url_prefix="/citizen")


@citizen_bp.route("/dashboard", methods=["GET"])
def dashboard():
    return render_template("citizen_dashboard.html")


@citizen_bp.route("/report", methods=["GET"])
def report_issue():
    return render_template("report_issue.html")
