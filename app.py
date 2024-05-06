import logging
from flask import Flask, jsonify, render_template, request

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)


@app.route("/")
def index():
    '''
    Serves the main HTML page for the application.

    Returns:
        The HTML content of the runwear.html template.
    '''
    return render_template('runwear.html')


@app.route("/about")
def about():
    '''
    Serves the 'About' page of the application.

    Returns:
        The HTML content of the about.html template.
    '''
    return render_template('about.html')


@app.route('/getClothing', methods=['POST'])
def get_clothing_recommendation():
    '''
    Processes POST request containing temperature and wind speed to determine
    appropriate clothing based on predefined conditions.

    Returns:
        A JSON response containing URLs of images representing the recommended clothing.
        Returns an error message and 500 status code if an exception occurs.
    Raises:
        Exception: Catches and logs unexpected errors during processing.
    '''
    try:
        data = request.json

        temp = int(round_temperature(data['temp']))
        wind_speed = process_wind_speed(data['windSpeed'])
        conditions = get_conditions(wind_speed)

        recommended_clothing = clothingRecommendationMatrix.get(
            temp, {}).get(conditions, [])

        image_urls = [clothing_images[item]
                      for item in recommended_clothing if item in clothing_images]
        return jsonify({"imageUrls": image_urls})

    except Exception as e:
        logging.exception("Error processing request")
        return jsonify({"error": str(e)}), 500


def round_temperature(temp):
    '''
    Rounds a temperature value to the nearest 5 degrees for consistent matrix lookup.

    Args:
        temp (str): The temperature string to round.
    Returns:
        str: The rounded temperature as a string, adjusted to nearest 5 degrees.
    '''
    return str(round(float(temp) / 5) * 5)


def process_wind_speed(wind_speed):
    '''
    Extracts the numeric part from a wind speed string assumed to be in the format "XX mph".

    Args:
        wind_speed (str): The wind speed string from which to extract the numeric part.
    Returns:
        str: The numeric part of the wind speed.
    '''
    wind_speed_num = wind_speed.split(' ')[0]
    return wind_speed_num


def get_conditions(wind_speed):
    '''
    Determines wind conditions based on the wind speed.

    Args:
        wind_speed (str): The wind speed in mph as a string.
    Returns:
        str: 'windy' if wind speed is greater than 10 mph, otherwise 'calm'.
    '''
    if int(wind_speed) > 10:
        conditions = 'windy'
    else:
        conditions = 'calm'
    return conditions


clothing_images = {
    'tanktop': 'static/images/tanktop.svg',
    'shirt': 'static/images/shirt.svg',
    'longsleeve': 'static/images/longsleeve.svg',
    'fleece': 'static/images/fleece.svg',
    'jacket': 'static/images/jacket.svg',
    'shorts': 'static/images/shorts.svg',
    'tights': 'static/images/tights.svg',
    'fleeceTights': 'static/images/fleeceTights.svg',
    'cap': 'static/images/cap.svg',
    'beanie': 'static/images/beanie.svg',
    'gloves': 'static/images/gloves.svg',
    'scarf': 'static/images/scarf.svg'
}

clothingRecommendationMatrix = {
    100: {
        'calm': ["tanktop", "shorts", "cap"],
        'windy': ["tanktop", "shorts", "cap"]
    },
    95: {
        'calm': ["tanktop", "shorts", "cap"],
        'windy': ["tanktop", "shorts", "cap"]
    },
    90: {
        'calm': ["tanktop", "shorts", "cap"],
        'windy': ["tanktop", "shorts", "cap"]
    },
    85: {
        'calm': ["tanktop", "shorts", "cap"],
        'windy': ["tanktop", "shorts", "cap"]
    },
    80: {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["shirt", "shorts", "cap"]
    },
    75: {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["shirt", "shorts", "cap"]
    },
    70: {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["shirt", "shorts", "cap"]
    },
    65: {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["shirt", "shorts", "cap"]
    },
    60: {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["longsleeve", "shorts", "cap"]
    },
    55: {
        'calm': ["shirt", "shorts", "cap"],
        'windy': ["longsleeve", "shorts", "cap"]
    },
    50: {
        'calm': ["longsleeve", "shorts", "cap"],
        'windy': ["shirt", "longsleeve", "shorts", "cap"]
    },
    45: {
        'calm': ["shirt", "longsleeve", "shorts", "cap", "gloves"],
        'windy': ["shirt", "fleece", "shorts", "cap", "gloves"]
    },
    40: {
        'calm': ["shirt", "fleece", "shorts", "cap", "gloves"],
        'windy': ["shirt", "fleece", "jacket", "tights", "beanie", "gloves"]
    },
    35: {
        'calm': ["shirt", "fleece", "jacket", "tights", "beanie", "gloves"],
        'windy': ["longsleeve", "fleece", "jacket", "shorts", "tights", "beanie", "gloves"]
    },
    30: {
        'calm': ["longsleeve", "fleece", "jacket", "shorts", "tights", "beanie", "gloves"],
        'windy': ["longsleeve", "fleece", "jacket", "shorts", "fleeceTights", "beanie", "gloves"]
    },
    25: {
        'calm': ["longsleeve", "fleece", "jacket", "shorts", "fleeceTights", "beanie", "gloves"],
        'windy': ["longsleeve", "fleece", "jacket", "tights", "fleeceTights", "beanie", "gloves", "scarf"]
    },
    20: {
        'calm': ["longsleeve", "fleece", "jacket", "tights", "fleeceTights", "beanie", "gloves", "scarf"],
        'windy': ["shirt", "longsleeve", "fleece", "jacket", "tights", "fleeceTights", "beanie", "gloves", "scarf"]
    }
}
