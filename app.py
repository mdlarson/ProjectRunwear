from flask import Flask
from flask import render_template
from flask import request
from markupsafe import escape

app = Flask(__name__)


@app.route("/")
def index():
    world = "derp derp"
    return render_template('runwear.html')


@app.route("/about")
def about():
    return render_template('about.html')
