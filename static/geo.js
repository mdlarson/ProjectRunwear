// fetch location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// show position
function showPosition(position) {
    console.log(position.coords.latitude + ", " + position.coords.longitude);

    // display in output div
    document.getElementById('output').innerHTML = position.coords.latitude + ", " + position.coords.longitude;

    // also send to Flask server
    fetch('/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success: ', data);
        })
        .catch((error) => {
            console.error('Error: ', error)
        })
}

// error handling
function showError(error) {
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

// call getLocation() on page load
// window.onload = getLocation;