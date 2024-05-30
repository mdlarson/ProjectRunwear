const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();
const geo = require('../static/geo');

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    console.error.mockRestore();
});

describe('geo.js tests', () => {
    let mockGeolocation;

    beforeEach(() => {
        // Mocking the navigator.geolocation object
        mockGeolocation = {
            getCurrentPosition: jest.fn()
        };

        global.navigator.geolocation = mockGeolocation;
    });

    // ensures navigator.geolocation.getCurrentPosition is called
    test('getLocation calls navigator.geolocation.getCurrentPosition', () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
            success({
                coords: {
                    latitude: 51.1,
                    longitude: 45.3
                }
            })
        );
        geo.getLocation();
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    // mocks a fetch response for ZIP code lookup and ensures fetch is called with correct URL
    test('getWeatherByZip fetches coordinates based on ZIP code', async () => {
        fetch.mockResponseOnce(JSON.stringify({
            places: [{
                latitude: "40.71289",
                longitude: "-74.0060"
            }]
        }));
        document.body.innerHTML = '<input id="zipInput" value="10001"/>';
        await geo.getWeatherByZip();
        expect(fetch).toHaveBeenCalledWith("https://api.zippopotam.us/us/10001");
    });

    // mocks weather API response and ensures the DOM is updated correctly
    test('displayWeather fetches weather data and updates the DOM', async () => {
        fetch.mockResponses(
            [JSON.stringify({ properties: { forecastHourly: "https://api.weather.gov/gridpoints/OKX/25,46/forecast/hourly" } })],
            [JSON.stringify({
                properties: {
                    periods: [{
                        temperature: 72,
                        temperatureUnit: 'F',
                        shortForecast: 'Sunny',
                        windSpeed: '10 mph',
                        probabilityOfPrecipitation: { value: 10 }
                    }]
                }
            })]
        );
        document.body.innerHTML = `
            <div id="forecastOutput"></div>
            <div id="forecastSourceOutput"></div>
        `;
        await geo.displayWeather(40.7128, -74.0060);
        expect(fetch).toHaveBeenCalledWith("https://api.weather.gov/points/40.7128,-74.0060");
        expect(document.getElementById('forecastOutput').textContent).toContain('72ºF');
    });

    // TODO: fetchWeather goes here

    // TODO: write better note
    test('updateWeatherDisplay updates the DOM and fetches clothing recommendations', async () => {
        document.body.innerHTML = `
            <div id="forecastOutput"></div>
            <div id="forecastSourceOutput"></div>
            <div id="recommendationOutput"></div>
        `;

        fetch.mockResponseOnce(JSON.stringify({ imageUrls: ['mockUrl1', 'mockUrl2'] }));

        await geo.updateWeatherDisplay(70, 'F', 'Sunny', '5 mph', 0);

        expect(document.getElementById('forecastOutput').textContent).toBe('70ºF, Sunny, 5 mph wind, 0% chance of rain');
        expect(document.getElementById('forecastSourceOutput').textContent).toBe('');
        expect(fetch).toHaveBeenCalledWith('/getClothing', expect.any(Object));
    });

    // TODO: displayClothingRecommendations needs a better docstring....
    test('displayClothingRecommendations displays images correctly', () => {
        document.body.innerHTML = '<div id="recommendationOutput"></div>';
        const mockData = { imageUrls: ['mockUrl1', 'mockUrl2'] };

        geo.displayClothingRecommendations(mockData);

        expect(document.getElementById('recommendationOutput').innerHTML).toBe('<img src="mockUrl1" alt="clothing item" width="200px"><img src="mockUrl2" alt="clothing item" width="200px">');
    });

    // TODO: fetchAPI needs a better docstring...
    test('fetchAPI throws error on bad response', async () => {
        fetch.mockResponseOnce(null, { status: 404 });

        await expect(geo.fetchAPI('mockUrl')).rejects.toThrow('HTTP error, status = 404');
    });

    // TODO: displayError needs a better docstring...
    test('displayError shows correct error message', () => {
        global.alert = jest.fn();

        // Mock the error object with expected constants
        const error = {
            code: 1,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
            UNKNOWN_ERROR: 4
        };

        geo.displayError(error);
        expect(global.alert).toHaveBeenCalledWith("User denied request for geolocation.");
    });

    // tests that a failed fetch response throws an error
    test('handleFetchResponse throws error on bad response', async () => {
        const mockResponse = {
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue({})
        };

        try {
            await geo.handleFetchResponse(mockResponse);
        } catch (error) {
            expect(error.message).toBe("HTTP error. Status: 404");
        }
    });

    // tests that errors are logged and the DOM is updated correctly
    test('logError updates DOM and logs error', () => {
        console.error = jest.fn()
        document.body.innerHTML = '<div id="forecastSourceOutput"></div>';

        const error = new Error('Test error');
        geo.logError(error);

        expect(console.error).toHaveBeenCalledWith('Error:', error);
        expect(document.getElementById('forecastSourceOutput').textContent).toBe('Failed to fetch weather data.');
    })

});