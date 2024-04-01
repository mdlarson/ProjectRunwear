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


@app.route("/getClothing")
def get_clothing_recommendation(temp, windSpeed):
    recommendations = []

    conditions = get_conditions(windSpeed)

    return (clothing_images[item] for item in clothingRecommendationMatrix[temp][conditions])


def get_conditions(windSpeed):
    if windSpeed > 10:
        conditions = 'windy'
    else:
        conditions = 'calm'
    return conditions


# Clothing References
clothing_images = ['a', 'b', 'c']

clothingRecommendationMatrix = {
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
