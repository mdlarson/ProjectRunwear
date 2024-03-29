// fetch location from browser
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayWeather, displayError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// given location, fetch weather
function fetchWeather(latitude, longitude) {
    const endpoint = `https://api.weather.gov/points/${latitude},${longitude}`;
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            // displaying forecast URL
            const forecastUrl = data.properties.forecastHourly;
            document.getElementById('forecastSourceOutput').innerHTML = `Getting forecast from <a href="${forecastUrl}">${forecastUrl}</a>`;

            // fetch forecast data
            fetch(forecastUrl)
                .then(response => response.json())
                .then(forecastData => {
                    const temp = forecastData.properties.periods[0].temperature;
                    const tempUnit = forecastData.properties.periods[0].temperatureUnit;
                    const forecastSummary = forecastData.properties.periods[0].shortForecast;
                    const precip = forecastData.properties.periods[0].probabilityOfPrecipitation.value;

                    document.getElementById('forecastOutput').innerHTML = `${temp}º${tempUnit}, ${forecastSummary}, ${precip}% chance of rain`;
                })
                .catch(error => console.error('Error fetching forecast: ', error));
        })
        .catch(error => {
            console.error('Error fetching weather: ', error);
            document.getElementById('forecastSourceOutput').innerHTML = "Failed to fetch weather data.";
        });
}

// process weather data for display
function displayWeather(position) {
    // TODO: trim extra digits from lat/long

    // display in output div
    document.getElementById('latLongOutput').innerHTML = position.coords.latitude + ", " + position.coords.longitude;

    // with location data, fetch weather
    fetchWeather(position.coords.latitude, position.coords.longitude);

}

// error handling
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