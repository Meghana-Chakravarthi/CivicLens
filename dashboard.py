from functools import wraps

from flask import Blueprint, current_app, flash, redirect, render_template, request, send_from_directory, session, url_for

import db


dashboard_bp = Blueprint("dashboard", __name__)
VALID_STATUSES = ("Pending", "In Progress", "Resolved", "Rejected")


def citizen_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            next_url = request.full_path.rstrip("?")
            return redirect(f"/auth/login?next={next_url}")
        if session.get("role") != "citizen":
            return "Citizen access required.", 403
        return view(*args, **kwargs)

    return wrapped


def fetch_one(cursor, query, params=()):
    cursor.execute(query, params)
    return cursor.fetchone()


def fetch_issue_rows(cursor, query, params=()):
    try:
        cursor.execute(query, params)
    except Exception as error:
        if "updated_at" not in str(error).lower():
            raise
        cursor.execute(query.replace(", updated_at", ", created_at AS updated_at"), params)
    return cursor.fetchall()


@dashboard_bp.get("/dashboard")
@citizen_required
def dashboard():
    try:
        connection = db.get_db()
        cursor = connection.cursor(dictionary=True)
        user_id = session["user_id"]
        summary = fetch_one(
            cursor,
            """
            SELECT COUNT(*) AS total,
                   COALESCE(SUM(status = 'Pending'), 0) AS pending,
                   COALESCE(SUM(status = 'In Progress'), 0) AS in_progress,
                   COALESCE(SUM(status = 'Resolved'), 0) AS resolved
            FROM issues
            WHERE user_id = %s
            """,
            (user_id,),
        )
        recent_issues = fetch_issue_rows(
            cursor,
            """
            SELECT id, category, description, status, created_at, updated_at
            FROM issues
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 5
            """,
            (user_id,),
        )
        return render_template("dashboard.html", summary=summary, recent_issues=recent_issues)
    except Exception:
        flash("We could not load your complaints right now. Please try again.", "danger")
        return render_template("dashboard.html", summary={}, recent_issues=[]), 503


@dashboard_bp.get("/my-issues")
@citizen_required
def my_issues():
    status = request.args.get("status", "All")
    if status != "All" and status not in VALID_STATUSES:
        status = "All"

    try:
        connection = db.get_db()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT id, category, description, status, created_at, updated_at
            FROM issues
            WHERE user_id = %s
        """
        params = [session["user_id"]]
        if status != "All":
            query += " AND status = %s"
            params.append(status)
        query += " ORDER BY created_at DESC"
        issues = fetch_issue_rows(cursor, query, tuple(params))
        return render_template("my_issues.html", issues=issues, selected_status=status, statuses=VALID_STATUSES)
    except Exception:
        flash("We could not load your complaints right now. Please try again.", "danger")
        return render_template("my_issues.html", issues=[], selected_status=status, statuses=VALID_STATUSES), 503


@dashboard_bp.get("/issue/<int:issue_id>")
@citizen_required
def issue_details(issue_id):
    try:
        connection = db.get_db()
        cursor = connection.cursor(dictionary=True)
        issue_rows = fetch_issue_rows(
            cursor,
            """
            SELECT id, category, description, image, latitude, longitude,
                   status, created_at, updated_at
            FROM issues
            WHERE id = %s AND user_id = %s
            """,
            (issue_id, session["user_id"]),
        )
        issue = issue_rows[0] if issue_rows else None
        if issue is None:
            return "Complaint not found.", 404
        return render_template("issue_details.html", issue=issue, statuses=VALID_STATUSES)
    except Exception:
        flash("We could not load that complaint right now. Please try again.", "danger")
        return redirect(url_for("dashboard.my_issues"))


@dashboard_bp.get("/issue/<int:issue_id>/image")
@citizen_required
def issue_image(issue_id):
    try:
        connection = db.get_db()
        cursor = connection.cursor(dictionary=True)
        issue = fetch_one(
            cursor,
            "SELECT image FROM issues WHERE id = %s AND user_id = %s",
            (issue_id, session["user_id"]),
        )
        if not issue or not issue.get("image"):
            return "Image not found.", 404
        return send_from_directory(current_app.config["UPLOAD_FOLDER"], issue["image"])
    except Exception:
        return "Image not found.", 404