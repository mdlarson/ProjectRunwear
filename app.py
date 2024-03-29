from flask import Flask, jsonify, render_template, request
from markupsafe import escape

app = Flask(__name__)


@app.route("/")
def index():
    world = "derp derp"
    return render_template('runwear.html')


@app.route("/about")
def about():
    return render_template('about.html')


# @app.route('/location', methods=['POST'])
# def location():
#     data = request.json
#     latitude = data['latitude']
#     longitude = data['longitude']
#     # process location data
#     return jsonify({'status': 'success', 'latitude': latitude, 'longitude': longitude})
