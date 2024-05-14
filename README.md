# Project Runwear

Project Runwear helps plan running outfits based on the weather.

The pages are served by a Python Flask app. The service uses JavaScript to fetch location details from the browser (or, a user-provided ZIP code is passed to [Zippopotam.us](https://zippopotam.us/) to obtain an estimated location). The location is then used fetch local weather details via the [U.S. National Weather Service API](https://www.weather.gov/documentation/services-web-api). Appropriate outfits are recommended based on the current weather conditions.