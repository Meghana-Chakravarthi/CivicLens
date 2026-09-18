# CivicLens

CivicLens is a college project for reporting civic issues such as potholes, garbage accumulation, broken streetlights, water leakage, damaged roads, overflowing drains, and damaged public property.

## Current status

This repository currently contains the minimal shared Flask application skeleton required for the team to build on top of it.

- No database logic has been implemented yet.
- No admin dashboard has been implemented yet.
- No AWS or S3 resources have been configured yet.

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app app run --debug
```

Then open http://127.0.0.1:5000/

## Important notes

- Keep all credentials in `.env` and never commit it.
- `.env.example` is the template for required environment variables.
- Do not add AI functionality or other unnecessary infrastructure yet.
