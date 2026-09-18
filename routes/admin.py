from urllib.parse import unquote, urlparse

import pymysql
from flask import Blueprint, current_app, jsonify, redirect, render_template, request, session, url_for

from config import DATABASE_URL

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")
admin_api_bp = Blueprint("admin_api", __name__, url_prefix="/api/admin")

ALLOWED_STATUSES = ["Reported", "Under Review", "In Progress", "Resolved"]


def require_admin():
    if session.get("user_id") and session.get("role") == "admin":
        return True
    return False


def get_db_config():
    try:
        parsed = urlparse(DATABASE_URL)
    except Exception:
        return None

    if parsed.scheme not in {"mysql", "mysql+pymysql"}:
        return None

    database_name = (parsed.path or "/civiclens").lstrip("/")
    if not database_name:
        database_name = "civiclens"

    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": unquote(parsed.username or ""),
        "password": unquote(parsed.password or ""),
        "database": unquote(database_name),
        "autocommit": True,
        "cursorclass": pymysql.cursors.DictCursor,
    }


def get_db_connection():
    db_config = get_db_config()
    if not db_config:
        return None

    try:
        return pymysql.connect(**db_config)
    except Exception as exc:
        current_app.logger.warning("Admin DB connection failed: %s", exc)
        return None


def serialize_issue(row):
    if not row:
        return None

    issue = dict(row)
    issue["latitude"] = float(issue["latitude"]) if issue.get("latitude") is not None else None
    issue["longitude"] = float(issue["longitude"]) if issue.get("longitude") is not None else None
    issue["created_at"] = issue.get("created_at").strftime("%Y-%m-%d %H:%M:%S") if issue.get("created_at") else None
    issue["updated_at"] = issue.get("updated_at").strftime("%Y-%m-%d %H:%M:%S") if issue.get("updated_at") else None
    return issue


def fetch_all_issues(status=None, category=None, search=None):
    conn = get_db_connection()
    if not conn:
        return []

    try:
        cursor = conn.cursor()
        query = """
            SELECT i.*, u.name AS citizen_name, u.email AS citizen_email
            FROM issues i
            LEFT JOIN users u ON u.id = i.user_id
            WHERE 1 = 1
        """
        params = []

        if status:
            query += " AND i.status = %s"
            params.append(status)

        if category:
            query += " AND (i.category = %s OR i.category_id = %s)"
            params.extend([category, category])

        if search:
            search_value = f"%{search}%"
            query += """
                AND (
                    i.description LIKE %s
                    OR i.category LIKE %s
                    OR i.address LIKE %s
                    OR u.name LIKE %s
                    OR u.email LIKE %s
                )
            """
            params.extend([search_value] * 5)

        query += " ORDER BY i.created_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [serialize_issue(row) for row in rows]
    except Exception as exc:
        current_app.logger.warning("Admin issue query failed: %s", exc)
        return []
    finally:
        conn.close()


def fetch_issue_by_id(issue_id):
    conn = get_db_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT i.*, u.name AS citizen_name, u.email AS citizen_email
            FROM issues i
            LEFT JOIN users u ON u.id = i.user_id
            WHERE i.id = %s
            """,
            (issue_id,),
        )
        row = cursor.fetchone()
        return serialize_issue(row)
    except Exception as exc:
        current_app.logger.warning("Admin detail query failed: %s", exc)
        return None
    finally:
        conn.close()


def fetch_dashboard_stats():
    conn = get_db_connection()
    if not conn:
        return {
            "total_issues": 0,
            "reported": 0,
            "under_review": 0,
            "in_progress": 0,
            "resolved": 0,
        }

    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_issues,
                SUM(CASE WHEN status = 'Reported' THEN 1 ELSE 0 END) AS reported,
                SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END) AS under_review,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
            FROM issues
            """
        )
        row = cursor.fetchone()
        return {
            "total_issues": int(row["total_issues"] or 0),
            "reported": int(row["reported"] or 0),
            "under_review": int(row["under_review"] or 0),
            "in_progress": int(row["in_progress"] or 0),
            "resolved": int(row["resolved"] or 0),
        }
    except Exception as exc:
        current_app.logger.warning("Admin stats query failed: %s", exc)
        return {
            "total_issues": 0,
            "reported": 0,
            "under_review": 0,
            "in_progress": 0,
            "resolved": 0,
        }
    finally:
        conn.close()


def update_issue_status(issue_id, new_status):
    if new_status not in ALLOWED_STATUSES:
        return False, "Invalid status value"

    conn = get_db_connection()
    if not conn:
        return False, "Database unavailable"

    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE issues SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (new_status, issue_id),
        )
        conn.commit()
        return cursor.rowcount > 0, None
    except Exception as exc:
        current_app.logger.warning("Admin status update failed: %s", exc)
        return False, "Unable to update issue status"
    finally:
        conn.close()


@admin_bp.route("", methods=["GET"])
def admin_dashboard():
    if not require_admin():
        return redirect(url_for("auth.login"))
    return render_template("admin_dashboard.html")


@admin_bp.route("/issues/<int:issue_id>", methods=["GET"])
def admin_issue_detail(issue_id):
    if not require_admin():
        return redirect(url_for("auth.login"))
    return render_template("admin_issue_details.html", issue_id=issue_id)


@admin_api_bp.route("/issues", methods=["GET"])
def admin_get_issues():
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401

    status = request.args.get("status")
    category = request.args.get("category")
    search = request.args.get("search")

    issues = fetch_all_issues(status=status, category=category, search=search)
    return jsonify({"issues": issues}), 200


@admin_api_bp.route("/issues/<int:issue_id>", methods=["GET"])
def admin_get_issue(issue_id):
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401

    issue = fetch_issue_by_id(issue_id)
    if issue is None:
        return jsonify({"error": "Issue not found"}), 404

    return jsonify({"issue": issue}), 200


@admin_api_bp.route("/issues/<int:issue_id>/status", methods=["PUT"])
def admin_update_issue_status(issue_id):
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401

    if issue_id is None or issue_id <= 0:
        return jsonify({"error": "Invalid issue ID"}), 400

    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip()

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    if new_status not in ALLOWED_STATUSES:
        return jsonify({"error": "Invalid status value"}), 400

    updated, error_message = update_issue_status(issue_id, new_status)
    if not updated:
        if error_message == "Database unavailable":
            return jsonify({"error": "Database unavailable"}), 500
        return jsonify({"error": error_message or "Issue not found"}), 404 if error_message is None else 400

    return jsonify({"message": "Issue status updated successfully", "status": new_status}), 200


@admin_api_bp.route("/stats", methods=["GET"])
def admin_get_stats():
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401

    stats = fetch_dashboard_stats()
    return jsonify(stats), 200
