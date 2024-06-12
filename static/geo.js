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

const logError = (error) => {
    console.error('Error:', error);
    const outputElement = document.getElementById('forecastSourceOutput');
    const prevForecast = document.getElementById('forecastOutput');
    if (outputElement) {
        outputElement.textContent = "Failed to fetch weather data.";
        prevForecast.textContent = "";
    }
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
        fetchAndDisplayWeather(latitude, longitude);
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
        await fetchAndProcessForecast(forecastUrl);
    } catch (error) {
        logError(error);
    }
};

const fetchAndProcessForecast = async (forecastUrl) => {
    try {
        const forecastData = await fetchForecastData(forecastUrl);
        console.log('forecastData fetched:', forecastData);
        const forecast = processForecastData(forecastData);
        updateWeatherDisplay(forecast);
    } catch (error) {
        logError(error);
    }
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
        console.error('No forecast periods available.');
        throw new Error('No forecast periods available.');
    }
};

const fetchWeatherData = async (latitude, longitude) => {
    const weatherData = await fetchAPI(`${WX_API_URL}${latitude.toFixed(4)},${longitude.toFixed(4)}`);
    return weatherData;
};

const fetchForecastData = async (forecastUrl) => {
    const response = await fetch(forecastUrl);
    const data = await response.json();
    return data;
};

const updateWeatherDisplay = ({ temperature, temperatureUnit, shortForecast, windSpeed, probabilityOfPrecipitation }) => {
    const forecastOutput = document.getElementById('forecastOutput');
    forecastOutput.textContent = `${temperature}º${temperatureUnit}, ${shortForecast}, ${windSpeed} wind, ${probabilityOfPrecipitation}% chance of rain`;
    document.getElementById('forecastSourceOutput').textContent = "";
    fetchClothingRecommendations({ temp: temperature, windSpeed: parseFloat(windSpeed) }); // Ensure windSpeed is a number
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
    if (!data || !Array.isArray(data.imageUrls)) {
        console.error('No image URLs available, or invalid format:', data);
        document.getElementById('recommendationOutput').textContent = 'No clothing recommendations available.';
        return;
    }
    const imagesHtml = data.imageUrls.map(url => `<img src="${url}" alt="clothing item" width="200px">`).join('');
    document.getElementById('recommendationOutput').innerHTML = imagesHtml;
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
        fetchAndProcessForecast,
        processForecastData,
        fetchWeatherData,
        fetchForecastData,
        updateWeatherDisplay,
        fetchClothingRecommendations,
        displayClothingRecommendations
    };
}
