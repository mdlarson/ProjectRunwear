from flask import Flask
from markupsafe import escape

app = Flask(__name__)


@app.route("/")
def hello_world():
    world = "derp derp"
    return f"<h1>Hello, {escape(world)}!</h1>"


@app.route("/about")
def about():
    return f"This is my first simple flask app. :)"
