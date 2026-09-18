import os

from flask import Flask, redirect, request, url_for

from dashboard import dashboard_bp
from db import close_db


def create_app(test_config=None):
	app = Flask(__name__)
	app.config.from_mapping(
		SECRET_KEY=os.getenv("SECRET_KEY", "dev-only-change-me"),
		DB_HOST=os.getenv("DB_HOST", "127.0.0.1"),
		DB_USER=os.getenv("DB_USER", "root"),
		DB_PASSWORD=os.getenv("DB_PASSWORD", ""),
		DB_NAME=os.getenv("DB_NAME", "civiclens"),
		UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), "uploads"),
	)
	if test_config:
		app.config.update(test_config)

	app.register_blueprint(dashboard_bp)
	app.teardown_appcontext(close_db)

	@app.get("/")
	def index():
		return redirect(url_for("dashboard.dashboard"))

	@app.get("/login")
	def login_placeholder():
		return "Login is provided by the authentication module.", 401

	@app.get("/report-issue")
	def report_issue_placeholder():
		return "Issue reporting is provided by the reporting module.", 501

	@app.get("/logout")
	def logout_placeholder():
		return "Logout is provided by the authentication module.", 501

	@app.errorhandler(404)
	def not_found(error):
		return "The requested page was not found.", 404

	@app.errorhandler(500)
	def server_error(error):
		return "Something went wrong while loading CivicLens.", 500

	return app


app = create_app()


if __name__ == "__main__":
	app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1")
