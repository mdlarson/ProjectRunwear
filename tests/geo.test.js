const geo = require('../static/geo');

jest.mock('../static/geo', () => ({
    ...jest.requireActual('../static/geo'), // preserve all but mocked functions
    fetchWeatherData: jest.fn(),
    fetchForecastData: jest.fn()
}));

describe('Core Weather/Location Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        geo.fetchWeatherData.mockResolvedValue({
            properties: {
                forecastHourly: 'https://api.weather.gov/gridpoints/OKX/35,34/forecast/hourly'
            }
        });

        geo.fetchForecastData.mockResolvedValue({
            properties: {
                periods: [
                    {
                        number: 1,
                        temperature: 70,
                        temperatureUnit: "F",
                        probabilityOfPrecipitation: { unitCode: "wmoUnit:percent", value: 10 },
                        windSpeed: "5 mph",
                        shortForecast: "Clear"
                    }
                ]
            }
        });

        global.fetch = jest.fn((url) => {
            if (url.includes('weather.gov/points')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        properties: {
                            forecastHourly: 'https://api.weather.gov/gridpoints/OKX/35,34/forecast/hourly'
                        }
                    })
                });
            } else if (url.includes('weather.gov/gridpoints/OKX/35,34/forecast/hourly')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        properties: {
                            periods: [
                                {
                                    number: 1,
                                    temperature: 70,
                                    temperatureUnit: "F",
                                    probabilityOfPrecipitation: { unitCode: "wmoUnit:percent", value: 10 },
                                    windSpeed: "5 mph",
                                    shortForecast: "Clear"
                                }
                            ]
                        }
                    })
                });
            } else if (url.includes('zippopotam.us/us/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        places: [{ latitude: '40.7128', longitude: '-74.0060' }]
                    })
                });
            } else if (url.includes('api.example.com/data')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: 'mockData' })
                });
            } else {
                return Promise.reject(new Error('Unknown URL'));
            }
        });
    });

    // test('fetchAndDisplayWeather should pass correct values to fetchWeatherData', async () => {
    //     const spyFetchWeatherData = jest.spyOn(geo, 'fetchWeatherData');

    //     // Call the function to test
    //     await geo.fetchAndDisplayWeather(40.7128, -74.0060);

    //     // Verify fetchWeatherData is called with the correct arguments
    //     expect(spyFetchWeatherData).toHaveBeenCalledWith(40.7128, -74.0060);
    // });

    test('processForecastData should return correctly formatted forecast data', () => {
        const mockForecastData = {
            properties: {
                periods: [{
                    temperature: 70,
                    temperatureUnit: 'F',
                    shortForecast: 'Clear',
                    windSpeed: '5 mph',
                    probabilityOfPrecipitation: { value: 10 }
                }]
            }
        };

        const result = geo.processForecastData(mockForecastData);

        expect(result).toEqual({
            temperature: 70,
            temperatureUnit: 'F',
            shortForecast: 'Clear',
            windSpeed: '5 mph',
            probabilityOfPrecipitation: 10
        });
    });

    test('processForecastData should throw an error if no forecast periods are available', () => {
        const mockForecastData = {
            properties: {
                periods: []
            }
        };

        expect(() => geo.processForecastData(mockForecastData)).toThrow('No forecast periods available.');
    });

    test('fetchLocationByZip should return latitude and longitude', async () => {
        const location = await geo.fetchLocationByZip('10001');
        expect(location).toEqual({ latitude: 40.7128, longitude: -74.0060 });
    });
});

describe('UI Update Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="forecastOutput"></div><div id="forecastSourceOutput"></div><div id="recommendationOutput"></div>';
    });

    test('updateWeatherDisplay should update the DOM with weather details', () => {
        const weatherData = {
            temperature: 70,
            temperatureUnit: 'F',
            shortForecast: 'Clear',
            windSpeed: '5 mph',
            probabilityOfPrecipitation: 10
        };

        geo.updateWeatherDisplay(weatherData);

        expect(document.getElementById('forecastOutput').textContent).toBe('70ºF, Clear, 5 mph wind, 10% chance of rain');
        expect(document.getElementById('forecastSourceOutput').textContent).toBe('');
    });

    test('displayClothingRecommendations should update the DOM with clothing images', () => {
        const data = {
            imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
        };

        geo.displayClothingRecommendations(data);

        expect(document.getElementById('recommendationOutput').innerHTML).toBe('<img src="https://example.com/image1.jpg" alt="clothing item" width="200px"><img src="https://example.com/image2.jpg" alt="clothing item" width="200px">');
    });
});

describe('Utility Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="forecastOutput"></div><div id="forecastSourceOutput"></div>';
    });

    test('fetchAPI should fetch data and return JSON', async () => {
        const data = await geo.fetchAPI('https://api.example.com/data');
        expect(data).toEqual({ data: 'mockData' });
    });

    test('fetchAPI should throw error on HTTP error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404
            })
        );
        await expect(geo.fetchAPI('https://api.example.com/data')).rejects.toThrow('HTTP error, status = 404');
    });

    test('logError should log error and update forecastSourceOutput', () => {
        document.body.innerHTML = `
            <div id="forecastSourceOutput"></div>
            <div id="forecastOutput"></div>
        `;

        const error = new Error('Test error');
        const originalConsoleError = console.error;
        console.error = jest.fn();

        geo.logError(error);

        expect(console.error).toHaveBeenCalledWith('Error:', error);
        expect(document.getElementById('forecastSourceOutput').textContent).toBe('Error:');
        expect(document.getElementById('forecastOutput').textContent).toBe('');

        console.error = originalConsoleError; // Restore original console.error
    });

    test('displayError should alert with the correct message', () => {
        global.alert = jest.fn();
        const error = { code: 1 };
        geo.displayError(error);
        expect(global.alert).toHaveBeenCalledWith('User denied request for geolocation.');
    });
});
