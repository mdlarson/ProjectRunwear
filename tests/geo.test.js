const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();
const geo = require('../static/geo');

beforeEach(() => {
    fetch.resetMocks();
    document.body.innerHTML = '';
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




    // tests that a failed fetch response throws an error
    test('handleFetchResponse throws error on bad response', async () => {
        const mockResponse = {
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue({})
        };
        console.log('mockResponse:', mockResponse);
        await expect(geo.handleFetchResponse(mockResponse)).rejects.toThrow("HTTP error. Status: 404");
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