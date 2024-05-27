"use strict";

const WX_API_URL = "https://api.weather.gov/points/";
const ZIP_API_URL = "https://api.zippopotam.us/us/";

/**
 * Attempts to get the current geographic location of the user using the browser's geolocation API.
 * On success, it calls displayWeather with the obtained latitude and longitude.
 * On failure, it calls displayError.
 * Alerts the user if geolocation is not supported.
 */
async function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        position => displayWeather(position.coords.latitude, position.coords.longitude),
        displayError
    );
}

/**
 * Fetches weather data based on a ZIP code input from the user.
 * Retrieves the geographic coordinates for the given ZIP code from an external API,
 * then displays weather information by calling displayWeather with those coordinates.
 * Alerts and focuses input if ZIP code is invalid.
 * @throws Will throw an error if the ZIP code API call fails or if the response is invalid.
 */
async function getWeatherByZip() {
    const zipInput = document.getElementById('zipInput');
    const zip = zipInput.value.trim();
    if (!zip || !/^\d{5}$/.test(zip)) {
        alert('Please enter a valid 5-digit ZIP code.');
        zipInput.focus();
        return;
    }

    try {
        const locationData = await fetchAPI(`${ZIP_API_URL}${encodeURIComponent(zip)}`);
        const latitude = parseFloat(locationData.places[0].latitude);
        const longitude = parseFloat(locationData.places[0].longitude);
        if (!isNaN(latitude) && !isNaN(longitude)) {
            displayWeather(latitude, longitude);
        } else {
            throw new Error('Invalid location data received.');
        }
    } catch (error) {
        logError(error);
        document.getElementById('forecastSourceOutput').textContent = "Failed to fetch location data.";
        document.getElementById('forecastOutput').textContent = "";
    }
}

/**
 * Fetches and displays weather information for given latitude and longitude coordinates.
 * This function fetches detailed hourly forecast information and updates the DOM to show these weather details.
 * It also triggers fetching clothing recommendations based on the weather data.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @throws Will throw an error if the weather API call fails or returns an invalid response.
 */
async function displayWeather(latitude, longitude) {
    try {
        const weatherData = await fetchAPI(`${WX_API_URL}${latitude.toFixed(4)},${longitude.toFixed(4)}`);
        const forecastData = await fetchAPI(weatherData.properties.forecastHourly);
        const { temperature, temperatureUnit, shortForecast, windSpeed } = forecastData.properties.periods[0];

        updateWeatherDisplay(temperature, temperatureUnit, shortForecast, windSpeed, forecastData.properties.periods[0].probabilityOfPrecipitation.value);
    } catch (error) {
        logError(error);
    }
}

/**
 * Retrieves weather information for specific geographic coordinates.
 * Contacts an API to get detailed weather information and updates relevant DOM elements to display this information.
 * Initiates a subsequent API call to get clothing recommendations based on the current weather conditions.
 * @param {number} latitude - Latitude for which to fetch weather.
 * @param {number} longitude - Longitude for which to fetch weather.
 * @throws Throws an error if unable to fetch weather data or if the API returns an error status.
 */
async function fetchWeather(latitude, longitude) {
    try {
        const endpoint = `${WX_API_URL}${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        const weatherData = await fetchAPI(endpoint);
        const forecastData = await fetchAPI(weatherData.properties.forecastHourly);

        const { temperature, temperatureUnit, shortForecast, windSpeed } = forecastData.properties.periods[0];
        updateWeatherDisplay(temperature, temperatureUnit, shortForecast, windSpeed, forecastData.properties.periods[0].probabilityOfPrecipitation.value);
    } catch (error) {
        logError(error);
    }
}


/**
 * Updates the webpage with detailed weather conditions and requests clothing recommendations.
 * Displays formatted weather information and sends a request to the server to retrieve suitable clothing options based on the current weather.
 * @param {number} temp - Current temperature.
 * @param {string} tempUnit - Unit of the temperature measurement (e.g., Celsius or Fahrenheit).
 * @param {string} forecastSummary - Brief description of the current weather.
 * @param {number} windSpeed - Current wind speed.
 * @param {number} precip - Probability of precipitation as a percentage.
 */
function updateWeatherDisplay(temp, tempUnit, forecastSummary, windSpeed, precip) {
    const forecastOutput = document.getElementById('forecastOutput');
    forecastOutput.textContent = `${temp}º${tempUnit}, ${forecastSummary}, ${windSpeed} wind, ${precip}% chance of rain`;
    document.getElementById('forecastSourceOutput').textContent = "";

    const postData = JSON.stringify({
        temp: parseFloat(temp),
        windSpeed: parseFloat(windSpeed)
    });

    fetch('/getClothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postData
    }).then(response => response.json())
        .then(data => displayClothingRecommendations(data))
        .catch(error => logError(error));
}

/**
 * Displays clothing recommendations based on the weather conditions.
 * This function takes a response object that includes image URLs for recommended clothing items and renders these images on the webpage.
 * It formats the URLs into image tags and updates the DOM to show these images in a designated area.
 *
 * @param {Object} data - The data object containing an array of image URLs. Each URL corresponds to an image of a recommended clothing item.
 *                       The 'imageUrls' property of this object is expected to be an array of strings.
 */
function displayClothingRecommendations(data) {
    if (!data || !Array.isArray(data.imageUrls)) {
        console.error('No image URLs available or invalid format:', data);
        document.getElementById('recommendationOutput').textContent = 'No clothing recommendations available.';
        return;
    }
    const imagesHtml = data.imageUrls.map(url => `<img src="${url}" alt="clothing item" width="200px">`).join('');
    document.getElementById('recommendationOutput').innerHTML = imagesHtml;
}


// Utility Functions

/**
 * Generic fetch function to retrieve data from a specified URL.
 * Ensures the HTTP response is valid and parses the response as JSON.
 * Designed to be reusable for various API endpoints within this script.
 * @param {string} url - The URL from which to fetch data.
 * @throws {Error} Throws an error if the response status code indicates a failure.
 */
async function fetchAPI(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
    }
    return response.json();
}

/**
 * Handles the HTTP response from fetch calls. Ensures the response is valid and returns the parsed JSON.
 * Throws an error if the response status is not okay, indicating that the request failed.
 *
 * @param {Response} response - The response object from a fetch call.
 * @returns {Promise<JSON>} A promise that resolves to the JSON content of the response.
 * @throws {Error} Throws an error if the response status code is not in the successful range.
 */
function handleFetchResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return response.json();
}

/**
 * Logs errors to the console and updates the webpage to indicate a problem with data retrieval.
 * This function acts as a central error handler for failed fetch operations, providing user feedback via the UI.
 * @param {Error} error - The error object to log and display.
 */
function logError(error) {
    console.error('Error:', error);
    const outputElement = document.getElementById('forecastSourceOutput');
    if (outputElement) {
        outputElement.textContent = "Failed to fetch weather data.";
    } else {
        console.error('Failed to find the forecast output element.');
    }
}

/**
 * Handles geolocation errors by alerting the user to the specific problem.
 * This function is designed to provide user-friendly error messages based on the geolocation error code.
 *
 * @param {PositionError} error - The error object containing the error code and message from the geolocation API.
 */
function displayError(error) {
    const errorMessages = {
        [error.PERMISSION_DENIED]: "User denied request for geolocation.",
        [error.POSITION_UNAVAILABLE]: "Location data is not available.",
        [error.TIMEOUT]: "The request for location data timed out.",
        [error.UNKNOWN_ERROR]: "An unknown error occurred."
    };
    alert(errorMessages[error.code] || "An error occurred during geolocation.");
}

// Export functions
module.exports = {
    getLocation,
    getWeatherByZip,
    displayWeather,
    fetchWeather,
    updateWeatherDisplay,
    displayClothingRecommendations,
    fetchAPI,
    handleFetchResponse,
    logError,
    displayError,
};