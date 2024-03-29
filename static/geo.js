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
            console.log(data);
            const forecastUrl = data.properties.forecastHourly;
            document.getElementById('weatherOutput').innerHTML = `Forecast from <a href="${forecastUrl}">${forecastUrl}</a>`;

            // fetch forecast data
            fetch(forecastUrl)
                .then(response => response.json())
                .then(forecastData => {
                    console.log(forecastData);
                    console.log(forecastData.properties.periods.temperature);
                    //process further from here
                })
                .catch(error => console.error('Error fetching forecast: ', error));
        })
        .catch(error => {
            console.error('Error fetching weather: ', error);
            document.getElementById('weatherOutput').innerHTML = "Failed to fetch weather data.";
        });
}

// process weather data for display
function displayWeather(position) {
    // TODO: trim extra digits from lat/long

    // display in output div
    document.getElementById('output').innerHTML = position.coords.latitude + ", " + position.coords.longitude;

    // with location data, fetch weather
    fetchWeather(position.coords.latitude, position.coords.longitude);




    // optional send to Flask server, if I think of a reason for it!
    // fetch('/location', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         latitude: position.coords.latitude,
    //         longitude: position.coords.longitude,
    //     }),
    // })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Success: ', data);
    //     })
    //     .catch((error) => {
    //         console.error('Error: ', error)
    //     })
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