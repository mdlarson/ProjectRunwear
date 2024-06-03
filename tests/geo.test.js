const geo = require('../static/geo');

describe('Utility Functions', () => {
    test('fetchAPI should fetch data and return JSON', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: 'mockData' })
            })
        );
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
        expect(document.getElementById('forecastSourceOutput').textContent).toBe('Failed to fetch weather data.');
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

describe('Core Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetchLocationByZip should return latitude and longitude', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    places: [{ latitude: '40.7128', longitude: '-74.0060' }]
                })
            })
        );
        const location = await geo.fetchLocationByZip('10001');
        expect(location).toEqual({ latitude: 40.7128, longitude: -74.0060 });
    });

    // test('fetchAndDisplayWeather should call updateWeatherDisplay with correct data', async () => {
    //     global.fetch = jest.fn()
    //         .mockResolvedValueOnce({
    //             ok: true,
    //             json: () => Promise.resolve({
    //                 properties: { forecastHourly: 'https://api.example.com/forecast' }
    //             })
    //         })
    //         .mockResolvedValueOnce({
    //             ok: true,
    //             json: () => Promise.resolve({
    //                 properties: {
    //                     periods: [
    //                         {
    //                             temperature: 70,
    //                             temperatureUnit: 'F',
    //                             shortForecast: 'Clear',
    //                             windSpeed: '5 mph',
    //                             probabilityOfPrecipitation: { value: 10 }
    //                         }
    //                     ]
    //                 }
    //             })
    //         });

    //     const updateWeatherDisplaySpy = jest.spyOn(geo, 'updateWeatherDisplay');

    //     await geo.fetchAndDisplayWeather(40.7128, -74.0060);

    //     expect(updateWeatherDisplaySpy).toHaveBeenCalledWith({
    //         temperature: 70,
    //         temperatureUnit: 'F',
    //         shortForecast: 'Clear',
    //         windSpeed: '5 mph',
    //         probabilityOfPrecipitation: 10
    //     });

    //     updateWeatherDisplaySpy.mockRestore();
    // });
});

describe('UI Update Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="forecastOutput"></div><div id="forecastSourceOutput"></div>';
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
        document.body.innerHTML = '<div id="recommendationOutput"></div>';
        const data = {
            imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
        };

        geo.displayClothingRecommendations(data);

        expect(document.getElementById('recommendationOutput').innerHTML).toBe('<img src="https://example.com/image1.jpg" alt="clothing item" width="200px"><img src="https://example.com/image2.jpg" alt="clothing item" width="200px">');
    });
});
