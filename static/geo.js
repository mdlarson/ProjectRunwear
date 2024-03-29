// Fetch location from browser
async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayWeather, displayError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Given location, fetch weather
async function fetchWeather(latitude, longitude) {
    try {
        const endpoint = `https://api.weather.gov/points/${latitude},${longitude}`;
        const response = await fetch(endpoint).then(handleFetchResponse);

        const forecastUrl = response.properties.forecastHourly;
        document.getElementById('forecastSourceOutput').innerHTML = `Getting forecast from <a href="${forecastUrl}">${forecastUrl}</a>`;

        const forecastData = await fetch(forecastUrl).then(handleFetchResponse);
        const { temperature, temperatureUnit, shortForecast } = forecastData.properties.periods[0];
        const probabilityOfPrecipitation = forecastData.properties.periods[0].probabilityOfPrecipitation.value;

        updateWeatherDisplay(temperature, temperatureUnit, shortForecast, probabilityOfPrecipitation);
    } catch (error) {
        logError(error);
    }
}

// Process weather data for display
function displayWeather(position) {
    const latitude = position.coords.latitude.toFixed(4);
    const longitude = position.coords.longitude.toFixed(4);

    document.getElementById('latLongOutput').innerHTML = `${latitude}, ${longitude}`;
    fetchWeather(latitude, longitude);
}

function updateWeatherDisplay(temp, tempUnit, forecastSummary, precip) {
    document.getElementById('forecastOutput').innerHTML = `${temp}º${tempUnit}, ${forecastSummary}, ${precip}% chance of rain`;
}

// Utility Functions
// Generic API response handling
function handleFetchResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error. Status: ' ${response.status}`);
    }
    return response.json();
}


// Generic error handling
function logError(error) {
    console.error(`Error: `, error);
    document.getElementById(`forecastSourceOutput`).innerHTML = "Failed to fetch weather data.";
}

function displayError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied request for geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location data is unavailable.");
            break;
        case error.TIMEOUT:
            alert("Request for location data timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}