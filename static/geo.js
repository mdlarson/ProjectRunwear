"use strict";
/**
 * Attempts to get the current geographic location of the user using the browser's geolocation API.
 * If successful, it will display the weather details for the current location.
 * Otherwise, it alerts the user that geolocation is not supported.
 */
async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayWeather, displayError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

/**
 * Fetches weather data based on a ZIP code input from user.
 * This function retrieves the geographic coordinates for the given ZIP code
 * and then calls `fetchWeather` to fetch and display the weather.
 *
 * @param {none} No parameters needed, reads ZIP code from HTML input field.
 * @throws Will throw an error if the ZIP code API call fails or returns an invalid response.
 */
async function getWeatherByZip() {
    const zip = document.getElementById('zipInput').value;
    if (!zip) {
        alert('Please enter a valid ZIP code.');
        return;
    }
    try {
        const geoApiUrl = `https://api.zippopotam.us/us/${zip}`;
        const locationResponse = await fetch(geoApiUrl);
        const locationData = await handleFetchResponse(locationResponse);
        const { latitude, longitude } = locationData.places[0];
        fetchWeather(latitude, longitude);
    } catch (error) {
        logError(error);
        document.getElementById('forecastSourceOutput').innerHTML = "Failed to fetch location data.";
    }
}


/**
 * Processes the geographical position obtained from the geolocation API and fetches the weather for that position.
 * Displays the latitude and longitude in a specific HTML element and initiates the weather fetching process.
 *
 * @param {Object} position - The position object returned from the geolocation API.
 *                           Contains coordinates with latitude and longitude.
 */
function displayWeather(position) {
    const latitude = position.coords.latitude.toFixed(4);
    const longitude = position.coords.longitude.toFixed(4);

    document.getElementById('latLongOutput').innerHTML = `Coordinates: ${latitude}, ${longitude}`;
    fetchWeather(latitude, longitude);
}


/**
 * Retrieves weather information for a specific latitude and longitude.
 * The function fetches detailed hourly forecast information and updates the DOM elements
 * to display these weather details. It also triggers fetching clothing recommendations.
 *
 * @param {number} latitude - The latitude of the location to fetch weather for.
 * @param {number} longitude - The longitude of the location.
 * @throws Will throw an error if the weather API call fails or returns an invalid response.
 */
async function fetchWeather(latitude, longitude) {
    try {
        const endpoint = `https://api.weather.gov/points/${latitude},${longitude}`;
        const response = await fetch(endpoint).then(handleFetchResponse);

        const forecastUrl = response.properties.forecastHourly;
        const forecastData = await fetch(forecastUrl).then(handleFetchResponse);
        const { temperature, temperatureUnit, shortForecast, windSpeed } = forecastData.properties.periods[0];
        const probabilityOfPrecipitation = forecastData.properties.periods[0].probabilityOfPrecipitation.value;

        updateWeatherDisplay(temperature, temperatureUnit, shortForecast, windSpeed, probabilityOfPrecipitation);
    } catch (error) {
        logError(error);
    }
}


/**
 * Updates the webpage with weather details and initiates a request to get clothing recommendations.
 * This function displays the current weather and then uses the weather details to query the server for clothing advice.
 *
 * @param {number} temp - The current temperature.
 * @param {string} tempUnit - The unit of the temperature (e.g., Celsius or Fahrenheit).
 * @param {string} forecastSummary - A short summary of the current weather conditions.
 * @param {number} windSpeed - The current wind speed.
 * @param {number} precip - The probability of precipitation as a percentage.
 */
function updateWeatherDisplay(temp, tempUnit, forecastSummary, windSpeed, precip) {
    document.getElementById('forecastOutput').innerHTML = `${temp}º${tempUnit}, ${forecastSummary}, ${windSpeed} wind, ${precip}% chance of rain`;

    fetch('/getClothing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            temp: temp,
            windSpeed: windSpeed
        })
    }).then(response => response.json())
        .then(data => {
            const imagesHtml = data.imageUrls.map(url => `<img src="${url}" alt="clothing item" width="200px">`).join('');
            document.getElementById('recommendationOutput').innerHTML = imagesHtml;
        })
}


// Utility Functions
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
        throw new Error(`HTTP error. Status: ' ${response.status}`);
    }
    return response.json();
}


/**
 * Logs errors to the console and updates the webpage to indicate a problem with fetching data.
 * This function is typically used as a catch handler in promise chains.
 *
 * @param {Error} error - The error object to log.
 */
function logError(error) {
    console.error(`Error: `, error);
    document.getElementById(`forecastSourceOutput`).innerHTML = "Failed to fetch weather data.";
}

/**
 * Handles geolocation errors by alerting the user to the specific problem.
 * This function is designed to provide user-friendly error messages based on the geolocation error code.
 *
 * @param {PositionError} error - The error object containing the error code and message from the geolocation API.
 */
function displayError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied request for geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location data is not available.");
            break;
        case error.TIMEOUT:
            alert("The request for location data timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Hmmm. An unknown error occurred.");
            break;
    }
}