from flask import Blueprint, render_template


issues_bp = Blueprint("issues", __name__, url_prefix="/issues")


@issues_bp.route("/details", methods=["GET"])
def issue_details():
    return render_template("issue_details.html")
