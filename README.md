# CivicLens

CivicLens is a Flask civic issue reporting application. This branch contains the citizen dashboard and complaint tracking module.

## Integration contract

The authentication module must set these Flask session values after login:

```python
session["user_id"] = user.id
session["role"] = user.role  # "citizen" for citizen dashboard access
```

The dashboard reads the shared MySQL `issues` table. It expects `id`, `user_id`, `category`, `description`, `image`, `latitude`, `longitude`, `status`, `created_at`, and `updated_at`. Admin status changes are reflected on the next dashboard request because every view queries MySQL again.

The reporting module owns `/report-issue`; the authentication module owns `/login` and `/logout`. The placeholders currently in `app.py` only make this standalone branch's dependency visible and should be replaced by the integrated routes without changing dashboard queries.

## Configuration

Set these environment variables before running the app:

- `SECRET_KEY`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Uploaded images should be stored in the repository's `uploads/` directory. The dashboard serves an image only after verifying that the requested issue belongs to the logged-in citizen.

## Local commands

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:FLASK_APP = "app.py"
flask run
pytest -q
```

The dashboard routes are `/dashboard`, `/my-issues`, and `/issue/<id>`. No dashboard data is duplicated outside the shared `issues` table.
