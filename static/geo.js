"use strict";

// Constants
const WX_API_URL = "https://api.weather.gov/points/";
const ZIP_API_URL = "https://api.zippopotam.us/us/";

// Utility Functions
const fetchAPI = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error, status = ${response.status}`);
    return response.json();
};

const handleError = (error, customMessage) => {
    console.error(customMessage, error);
    const outputElement = document.getElementById('forecastSourceOutput');
    const prevForecast = document.getElementById('forecastOutput');
    if (outputElement) {
        outputElement.textContent = customMessage || "An error occurred.";
        prevForecast.textContent = "";
    }
};

const logError = (error) => {
    handleError(error, 'Error:');
};

const displayError = (error) => {
    const errorMessages = {
        1: "User denied request for geolocation.",
        2: "Location data is not available.",
        3: "The request for location data timed out.",
        4: "An unknown error occurred."
    };
    alert(errorMessages[error.code] || "An error occurred during geolocation.");
};

// Core Functions
const getLocation = async () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        position => fetchAndDisplayWeather(position.coords.latitude, position.coords.longitude),
        displayError
    );
};

const getWeatherByZip = async () => {
    const zipInput = document.getElementById('zipInput');
    const zip = zipInput.value.trim();
    if (!zip || !/^\d{5}$/.test(zip)) {
        alert('Please enter a valid 5-digit ZIP code.');
        zipInput.focus();
        return;
    }

    try {
        const { latitude, longitude } = await fetchLocationByZip(zip);
        await fetchAndDisplayWeather(latitude, longitude);
    } catch (error) {
        logError(error);
    }
};

const fetchLocationByZip = async (zip) => {
    const locationData = await fetchAPI(`${ZIP_API_URL}${encodeURIComponent(zip)}`);
    const latitude = parseFloat(locationData.places[0].latitude);
    const longitude = parseFloat(locationData.places[0].longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid location data received.');
    }
    return { latitude, longitude };
};

const fetchAndDisplayWeather = async (latitude, longitude) => {
    try {
        const weatherData = await fetchWeatherData(latitude, longitude);
        const forecastUrl = weatherData.properties.forecastHourly;
        const forecastData = await fetchForecastData(forecastUrl);
        const forecast = processForecastData(forecastData);
        updateWeatherDisplay(forecast);
    } catch (error) {
        logError(error);
    }
};

const fetchWeatherData = async (latitude, longitude) => {
    return fetchAPI(`${WX_API_URL}${latitude.toFixed(4)},${longitude.toFixed(4)}`);
};

const fetchForecastData = async (forecastUrl) => {
    return fetchAPI(forecastUrl);
};

const processForecastData = (forecastData) => {
    const { periods } = forecastData.properties;
    if (periods && Array.isArray(periods) && periods.length > 0) {
        const currentPeriod = periods[0]; // current weather
        return {
            temperature: currentPeriod.temperature,
            temperatureUnit: currentPeriod.temperatureUnit,
            shortForecast: currentPeriod.shortForecast,
            windSpeed: currentPeriod.windSpeed,
            probabilityOfPrecipitation: currentPeriod.probabilityOfPrecipitation.value,
        };
    } else {
        handleError(null, 'No forecast periods available.');
        throw new Error('No forecast periods available.');
    }
};

const updateWeatherDisplay = ({ temperature, temperatureUnit, shortForecast, windSpeed, probabilityOfPrecipitation }) => {
    const forecastOutput = document.getElementById('forecastOutput');
    if (forecastOutput) {
        forecastOutput.textContent = `${temperature}º${temperatureUnit}, ${shortForecast}, ${windSpeed} wind, ${probabilityOfPrecipitation}% chance of rain`;
    }
    const forecastSourceOutput = document.getElementById('forecastSourceOutput');
    if (forecastSourceOutput) {
        forecastSourceOutput.textContent = "";
    }
    fetchClothingRecommendations({ temp: temperature, windSpeed: parseFloat(windSpeed) });
};

const fetchClothingRecommendations = async ({ temp, windSpeed }) => {
    const postData = JSON.stringify({ temp: parseFloat(temp), windSpeed: parseFloat(windSpeed) });
    try {
        const response = await fetch('/getClothing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: postData
        });
        const data = await response.json();
        displayClothingRecommendations(data);
    } catch (error) {
        logError(error);
    }
};

const displayClothingRecommendations = (data) => {
    const recommendationOutput = document.getElementById('recommendationOutput');
    if (!data || !Array.isArray(data.imageUrls)) {
        handleError(null, 'No image URLs available, or invalid format.');
        if (recommendationOutput) {
            recommendationOutput.textContent = 'No clothing recommendations available.';
        }
        return;
    }
    const imagesHtml = data.imageUrls.map(url => `<img src="${url}" alt="clothing item" width="200px">`).join('');
    if (recommendationOutput) {
        recommendationOutput.innerHTML = imagesHtml;
    }
};

// Export functions for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchAPI,
        logError,
        displayError,
        getLocation,
        getWeatherByZip,
        fetchLocationByZip,
        fetchAndDisplayWeather,
        processForecastData,
        updateWeatherDisplay,
        fetchClothingRecommendations,
        displayClothingRecommendations
    };
}
