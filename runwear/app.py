import logging
from flask import Flask, jsonify, render_template, request

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__,
            template_folder='../templates',
            static_folder='../static')


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
    Processes a POST request containing JSON data with temperature and wind speed to determine
    appropriate clothing based on predefined conditions. Uses a temperature lookup matrix
    to decide on clothing items and returns them as image URLs.

    Returns:
        jsonify: JSON object containing either the URLs of images or an error message.

    Raises:
        Exception: Catches broad exceptions, logs them, and returns a 500 server error response.
                   Specific exceptions (e.g., KeyError when accessing temperature or windSpeed)
                   should be handled and logged appropriately.

    '''
    try:
        data = request.json
        validate_request_data(data)

        temp = float(data.get('temp', 60))  # default if not provided
        wind_speed = float(data.get('windSpeed', 0))

        rounded_temp = round_temperature(temp)
        conditions = get_conditions(wind_speed)

        recommended_clothing = clothingRecommendationMatrix.get(
            rounded_temp, {}).get(conditions, [])

        image_urls = [clothing_images[item]
                      for item in recommended_clothing if item in clothing_images]
        return jsonify({"imageUrls": image_urls})

    except ValueError as e:
        logging.exception("Data type error: {}".format(e))
        return jsonify({"error": "Invalid data types provided"}), 400
    except Exception as e:
        logging.exception("Error processing request: {}".format(e))
        return jsonify({"error": str(e)}), 500


def round_temperature(temp):
    '''
    Rounds a temperature value to the nearest 5 degrees for consistent matrix lookup.

    Args:
        temp (str): The temperature string to round.
    Returns:
        int: The rounded temperature as an integer, adjusted to nearest 5 degrees.
    '''
    return round(float(temp) / 5) * 5


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
        return 'windy'
    else:
        return 'calm'


def validate_request_data(data):
    '''
    Validates the required fields in the data dictionary from the request JSON.
    Ensures that 'temp' and 'windSpeed' are present and can be correctly parsed.

    Args:
        data (dict): The JSON data converted to a dictionary.

    Returns:
        bool: True if valid, raises ValueError if invalid.
    '''
    if 'temp' not in data or 'windSpeed' not in data:
        raise ValueError("Temperature or wind speed data missing.")
    if not isinstance(data['temp'], (int, float)) or not isinstance(data['windSpeed'], (int, float)):
        raise ValueError("Temperature and wind speed must be numeric.")
    return True


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
