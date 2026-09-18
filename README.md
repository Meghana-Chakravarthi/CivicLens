# CivicLens

CivicLens is a Flask and MySQL civic issue reporting application for public
infrastructure problems such as potholes, garbage accumulation, broken
streetlights, water leakage, damaged roads, overflowing drains, and damaged
public property.

This repository contains the shared Flask application skeleton and the Member 3
citizen dashboard and complaint tracking module.

## Integration contract

The authentication module must set these Flask session values after login:

```python
session["user_id"] = user.id
session["role"] = user.role  # "citizen" for citizen dashboard access
```

The dashboard reads the shared MySQL `issues` table. It expects `id`, `user_id`,
`category`, `description`, `image`, `latitude`, `longitude`, `status`,
`created_at`, and `updated_at`. If `updated_at` is absent, the dashboard falls
back to `created_at` for display. Admin status changes are reflected on the next
request because the dashboard queries the database each time.

The existing `routes/` package is registered by `app.py`. Authentication owns
the `/auth` routes, reporting owns issue creation, and the Member 3 blueprint
owns `/dashboard`, `/my-issues`, `/issue/<id>`, and `/issue/<id>/image`.

## Configuration

Set these environment variables before running the app:

- `SECRET_KEY`
- `DEBUG`
- `DATABASE_URL`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Keep credentials in `.env` and never commit it. `.env.example` documents the
shared application configuration. Uploaded images are served only after the
dashboard verifies that the requested issue belongs to the logged-in citizen.

## Project structure

- `app.py`: shared Flask application factory and blueprint registration
- `config.py`: environment-backed application configuration
- `routes/`: shared authentication, citizen, and issue route modules
- `dashboard.py`, `db.py`: Member 3 dashboard routes and MySQL access
- `database/`: shared schema files
- `templates/`, `static/`: shared UI assets and views

## Local development

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
flask --app app run --debug
pytest -q
```

Then open http://127.0.0.1:5000/.
