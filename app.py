import os

from flask import Flask, render_template

from config import DEBUG, SECRET_KEY
from dashboard import dashboard_bp
from db import close_db
from routes import register_blueprints


def create_app(test_config=None):
	app = Flask(__name__)
	app.config.from_mapping(
		SECRET_KEY=SECRET_KEY,
		DEBUG=DEBUG,
		DB_HOST=os.getenv("DB_HOST", "127.0.0.1"),
		DB_USER=os.getenv("DB_USER", "root"),
		DB_PASSWORD=os.getenv("DB_PASSWORD", ""),
		DB_NAME=os.getenv("DB_NAME", "civiclens"),
		UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), "uploads"),
	)
	if test_config:
		app.config.update(test_config)

	register_blueprints(app)
	app.register_blueprint(dashboard_bp)
	app.teardown_appcontext(close_db)

	@app.get("/")
	def index():
		return render_template("index.html")

	return app


app = create_app()


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5000, debug=DEBUG)
