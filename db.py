from urllib.parse import unquote, urlparse

import mysql.connector
from flask import current_app, g


def get_db():
    if "db" not in g:
        database_url = current_app.config.get("DATABASE_URL", "")
        parsed = urlparse(database_url) if database_url else None
        g.db = mysql.connector.connect(
            host=current_app.config.get("DB_HOST") or (parsed.hostname if parsed else None) or "127.0.0.1",
            port=current_app.config.get("DB_PORT") or (parsed.port if parsed else None) or 3306,
            user=current_app.config.get("DB_USER") or (unquote(parsed.username) if parsed and parsed.username else None) or "root",
            password=current_app.config.get("DB_PASSWORD") or (unquote(parsed.password) if parsed and parsed.password else ""),
            database=current_app.config.get("DB_NAME") or ((parsed.path or "").lstrip("/") if parsed else "") or "civiclens",
        )
    return g.db


def close_db(error=None):
    connection = g.pop("db", None)
    if connection is not None and connection.is_connected():
        connection.close()