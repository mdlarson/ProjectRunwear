import logging
from flask import Flask, jsonify, render_template, request
from markupsafe import escape

logging.basicConfig(level=logging.DEBUG)


app = Flask(__name__)


@app.route("/")
def index():
    return render_template('runwear.html')


@app.route("/about")
def about():
    return render_template('about.html')


@app.route('/getClothing', methods=['POST'])
def get_clothing_recommendation():
    # Given weather conditions, identify appropriate clothing, return related images
    try:
        data = request.json

        # Process weather details
        temp = round_temperature(data['temp'])
        wind_speed = process_wind_speed(data['windSpeed'])
        conditions = get_conditions(wind_speed)

        # Retrieve the appropriate set of clothing
        recommended_clothing = clothingRecommendationMatrix.get(
            temp, {}).get(conditions, [])

        # Fetch and return images for that set of clothing
        image_urls = [clothing_images[item]
                      for item in recommended_clothing if item in clothing_images]
        return jsonify({"imageUrls": image_urls})

    except Exception as e:
        logging.exception("Error processing request")
        return jsonify({"error": str(e)}), 500


def round_temperature(temp):
    # Round temperature to nearest 5-degree increment
    return str(round(float(temp) / 5) * 5)


def process_wind_speed(wind_speed):
    # Extract integer portion of wind speed string
    wind_speed_num = wind_speed.split(' ')[0]
    return wind_speed_num


# Categorize wind conditions
def get_conditions(wind_speed):
    if int(wind_speed) > 10:
        conditions = 'windy'
    else:
        conditions = 'calm'
    return conditions


# Clothing References
clothing_images = {
    'shirt': 'static/images/shirt.svg',
    'longsleeve': 'static/images/longsleeve.svg',
    'fleece': 'static/images/fleece.svg',
    'jacket': 'static/images/jacket.svg',
    'shorts': 'static/images/shorts.svg',
    'lightTights': 'static/images/lightTights.svg',
    'beanie': 'static/images/beanie.svg',
    'gloves': 'static/images/gloves.svg',
}

clothingRecommendationMatrix = {
    '70': {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["shirt", "shorts", "cap"]
    },
    '65': {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["shirt", "shorts", "cap"]
    },
    '60': {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["longsleeve", "shorts", "cap"]
    },
    '55': {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["longsleeve", "shorts", "cap"]
    },
    '50': {
        'calm': ["longsleeve", "shorts", "cap"],
        'windy': ["shirt", "longsleeve", "shorts", "cap"]
    },
    '45': {
        'calm': ["shirt", "longsleeve", "shorts", "cap"],
        'windy': ["shirt", "fleece", "shorts", "cap", "gloves"]
    },
    '40': {
        'calm': ["shirt", "fleece", "shorts", "cap", "gloves"],
        'windy': ["shirt", "fleece", "jacket", "lightTights", "beanie", "gloves"]
    },
    '35': {
        'calm': ["shirt", "fleece", "jacket", "tights", "beanie", "gloves"],
        'windy': ["longsleeve", "fleece", "jacket", "shorts", "tights", "beanie", "gloves"]
    },
    '30': {
        'calm': ["longsleeve", "fleece", "jacket", "shorts", "tights", "beanie", "gloves"],
        'windy': ["longsleeve", "fleece", "jacket", "tights", "joggers", "beanie", "gloves"]
    },
    '25': {
        'calm': ["longsleeve", "fleece", "jacket", "fleeceTights", "joggers", "beanie", "gloves"],
        'windy': ["longsleeve", "fleece", "jacket", "fleeceTights", "joggers", "beanie", "gloves", "scarf"]
    },
    '20': {
        'calm': ["longsleeve", "fleece", "jacket", "tights", "joggers", "beanie", "gloves", "scarf"],
        'windy': ["shirt", "longsleeve", "fleece", "jacket", "tights", "joggers", "beanie", "gloves", "scarf"]
    }
}
