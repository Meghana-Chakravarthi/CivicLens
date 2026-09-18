from datetime import datetime

import pytest

import db
from app import create_app


ISSUES = [
    {"id": 1, "user_id": 7, "category": "Potholes", "description": "Large pothole", "image": None, "latitude": 12.1, "longitude": 77.1, "status": "In Progress", "created_at": datetime(2026, 1, 2), "updated_at": datetime(2026, 1, 3)},
    {"id": 2, "user_id": 7, "category": "Streetlights", "description": "Light is out", "image": None, "latitude": None, "longitude": None, "status": "Resolved", "created_at": datetime(2026, 1, 1), "updated_at": datetime(2026, 1, 4)},
    {"id": 3, "user_id": 8, "category": "Garbage", "description": "Other citizen issue", "image": None, "latitude": None, "longitude": None, "status": "Pending", "created_at": datetime(2026, 1, 5), "updated_at": datetime(2026, 1, 5)},
]


class FakeCursor:
    def __init__(self, user_id):
        self.user_id = user_id
        self.rows = []

    def execute(self, query, params=()):
        if "COUNT(*)" in query:
            own = [issue for issue in ISSUES if issue["user_id"] == params[0]]
            self.rows = [{"total": len(own), "pending": sum(i["status"] == "Pending" for i in own), "in_progress": sum(i["status"] == "In Progress" for i in own), "resolved": sum(i["status"] == "Resolved" for i in own)}]
        elif "id = %s AND user_id = %s" in query:
            self.rows = [issue for issue in ISSUES if issue["id"] == params[0] and issue["user_id"] == params[1]]
        else:
            own = [issue for issue in ISSUES if issue["user_id"] == params[0]]
            if len(params) > 1:
                own = [issue for issue in own if issue["status"] == params[1]]
            self.rows = own

    def fetchone(self):
        return self.rows[0] if self.rows else None

    def fetchall(self):
        return self.rows


class FakeConnection:
    def __init__(self, user_id=7):
        self.user_id = user_id

    def cursor(self, dictionary=False):
        return FakeCursor(self.user_id)


@pytest.fixture
def client(monkeypatch):
    app = create_app({"TESTING": True, "SECRET_KEY": "test"})
    monkeypatch.setattr(db, "get_db", lambda: FakeConnection())
    return app.test_client()


def login(client, user_id=7, role="citizen"):
    with client.session_transaction() as session:
        session["user_id"] = user_id
        session["role"] = role


def test_dashboard_requires_login(client):
    response = client.get("/dashboard")
    assert response.status_code == 302
    assert "/auth/login" in response.location


def test_non_citizen_access_is_rejected(client):
    login(client, role="admin")
    assert client.get("/dashboard").status_code == 403
    assert client.get("/my-issues").status_code == 403
    assert client.get("/issue/1").status_code == 403


def test_dashboard_shows_live_counts_and_status(client):
    login(client)
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert b">2<" in response.data
    assert b"In Progress" in response.data


def test_only_current_users_complaints_appear(client):
    login(client)
    response = client.get("/my-issues")
    assert b"Large pothole" in response.data
    assert b"Other citizen issue" not in response.data


def test_status_filter_uses_database_status(client):
    login(client)
    response = client.get("/my-issues?status=Resolved")
    assert response.status_code == 200
    assert b"Light is out" in response.data
    assert b"Large pothole" not in response.data


def test_owner_can_view_details(client):
    login(client)
    response = client.get("/issue/1")
    assert response.status_code == 200
    assert b"In Progress" in response.data
    assert b"12.1" in response.data


def test_other_users_issue_is_hidden(client):
    login(client)
    response = client.get("/issue/3")
    assert response.status_code == 404
    assert b"Other citizen issue" not in response.data


def test_invalid_issue_id_is_handled(client):
    login(client)
    assert client.get("/issue/999").status_code == 404


def test_empty_complaint_list(client, monkeypatch):
    monkeypatch.setattr(db, "get_db", lambda: FakeConnection(user_id=99))
    login(client, user_id=99)
    response = client.get("/my-issues")
    assert response.status_code == 200
    assert b"No complaints found" in response.data