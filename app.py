import os

from flask import Flask, render_template

from config import DATABASE_URL, DEBUG, SECRET_KEY
from dashboard import dashboard_bp
from db import close_db
from routes import register_blueprints


def create_app(test_config=None):
	app = Flask(__name__)
	app.config.from_mapping(
		SECRET_KEY=SECRET_KEY,
		DEBUG=DEBUG,
		DATABASE_URL=DATABASE_URL,
		DB_HOST=os.getenv("DB_HOST"),
		DB_PORT=os.getenv("DB_PORT"),
		DB_USER=os.getenv("DB_USER"),
		DB_PASSWORD=os.getenv("DB_PASSWORD"),
		DB_NAME=os.getenv("DB_NAME"),
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
