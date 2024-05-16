'''
This module contains the test cases for the Flask application located in the `runwear` package.

The tests focus on ensuring that the endpoints of the Flask application function as expected under various conditions.
It uses the pytest framework for setting up and running the tests. The tests cover the following:

- Ensuring that the '/getClothing' endpoint correctly processes incoming data and returns appropriate responses.
  This includes checking the response status code, the presence of expected keys in the JSON response, and the correctness
  of the response content based on given inputs.

Dependencies:
- pytest: Used for all tests within this module.
- Flask Testing: Used to provide a test client for the application to simulate requests to the Flask application.

Example:
Run these tests from the command line using the pytest runner:
    $ pytest tests/test_app.py

Ensure that the application and test environment is properly configured before running tests.
'''
import pytest
from runwear.app import app, get_conditions, process_wind_speed, round_temperature, validate_request_data


@pytest.fixture
def client():
    '''
    Sets up a Flask test client for testing.

    Yields:
        client: A test client for the Flask application.
    '''
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_index_page(client):
    '''
    GIVEN a Flask application configured for testing
    WHEN the '/' route is requested (GET)
    THEN check that the response is valid (200 OK) and the content includes expected text from the HTML template
    '''
    response = client.get('/')
    assert response.status_code == 200
    assert 'What should I wear on my run?' in response.get_data(as_text=True)


def test_about_page(client):
    '''
    GIVEN a Flask application configured for testing
    WHEN the '/about' route is requested (GET)
    THEN check that the response is valid (200 OK) and includes expected content
    '''
    response = client.get('/about')
    assert response.status_code == 200
    assert 'About' in response.get_data(as_text=True)


def test_get_clothing_recommendation(client):
    '''
    GIVEN a Flask application configured for testing
    WHEN the '/getClothing' route is posted with valid temperature and wind speed JSON data
    THEN check that the response status is 200 and contains image URLs
    '''
    response = client.post('/getClothing', json={'temp': 70, 'windSpeed': 5})
    assert response.status_code == 200
    assert 'imageUrls' in response.get_json()
    # Ensure it returns a list
    assert isinstance(response.get_json()['imageUrls'], list)


def test_get_clothing_recommendation_invalid_data(client):
    '''
    GIVEN a Flask application configured for testing
    WHEN the '/getClothing' route is posted with invalid data types for temperature and wind speed
    THEN check that the response status is 400 and contains an appropriate error message
    '''
    invalid_data = {'temp': 'cool', 'windSpeed': 'breezy'}
    response = client.post('/getClothing', json=invalid_data)
    assert response.status_code == 400
    assert 'Invalid data types provided' in response.get_json()['error']


def test_get_conditions():
    '''
    GIVEN a wind speed value
    WHEN the get_conditions function is called
    THEN check that the correct wind condition ('windy' or 'calm') is returned

    Test Cases:
    - A wind speed of 15 should return 'windy'.
    - A wind speed of 10 should return 'calm'.
    - A wind speed of 5 should return 'calm'.
    '''
    assert get_conditions(5) == 'calm'
    assert get_conditions(10) == 'calm'
    assert get_conditions(15) == 'windy'


def test_process_wind_speed():
    '''
    GIVEN a wind speed value string to truncate
    WHEN the process_wind_speed function is called
    THEN check that only the numeric part of the string is returned as a string

    Test Cases:
    - A wind speed of "0 mph" should return "0".
    - A wind speed of "10 mph" should return "10".
    - A wind speed of " 20 mph " should return "20" (leading/trailing spaces).
    - A wind speed of "mph 30" should raise a ValueError.
    - An empty string should raise a ValueError.
    '''
    assert process_wind_speed("0 mph") == "0"
    assert process_wind_speed("10 mph") == "10"
    assert process_wind_speed(" 20 mph ") == "20"

    with pytest.raises(ValueError):
        process_wind_speed("mph 30")

    with pytest.raises(ValueError):
        process_wind_speed("")


def test_round_temperature_normal_cases():
    '''
    GIVEN a temperature value to be rounded
    WHEN the round_temperature function is called
    THEN check that the temperature is correctly rounded to the nearest 5 degrees

    Test Cases:
    - A temperature of 73 should round up to 75.
    - A temperature of 78 should round up to 80.
    - A temperature of 61 should round down to 60.
    - A temperature of 64 should round up to 65.
    '''
    assert round_temperature(73) == 75
    assert round_temperature(78) == 80
    assert round_temperature(61) == 60
    assert round_temperature(64) == 65


def test_round_temperature_edge_cases():
    '''
    GIVEN a temperature value to be rounded
    WHEN the round_temperature function is called
    THEN check that the temperature is correctly rounded to the nearest 5 degrees

    Test Cases:
    - A temperature value of 72.511 should round down to 70.
    - A temperature value of 67.522 should round up to 70.
    - A temperature value of 37.433 should round down to 35.
    - A temperature value of 32.544 should round up to 30.
    '''
    assert round_temperature(72.5) == 70  # Halfway case, should round down
    assert round_temperature(67.5) == 70  # Halfway case, should round up
    assert round_temperature(37.4) == 35  # Halfway case, should round down
    assert round_temperature(32.5) == 30  # Halfway case, should round up


def test_round_temperature_boundary_cases():
    '''
    GIVEN a temperature value to be rounded
    WHEN the round_temperature function is called on extreme boundary case
    THEN check that the temperature is correctly rounded to the nearest 5 degrees

    Test Cases:
    - A temperature value of 1000 should round to 1000.
    - A temperature value of -1000 should round to -1000.
    '''
    assert round_temperature(1000) == 1000
    assert round_temperature(-1000) == -1000


def test_round_temperature_invalid_input():
    '''
    GIVEN an invalid temperature value
    WHEN the round_temperature function is called
    THEN check that a TypeError or ValueError is raised

    Test Cases:
    - A string value should raise a ValueError
    - An empty string should raise a ValueError
    - A NoneType should raise a TypeError
    '''
    with pytest.raises(ValueError):
        round_temperature("not a number")
    with pytest.raises(ValueError):
        round_temperature("")
    with pytest.raises(ValueError):
        round_temperature(None)


def test_validate_request_data():
    '''
    GIVEN a dictionary containing temperature and wind speed
    WHEN the validate_request_data function is called
    THEN check that the function validates the data correctly and raises ValueError for invalid data

    Test Cases:
    - A valid data dictionary should return True.
    - A dictionary missing the 'temp' key should raise ValueError.
    - A dictionary with a non-numeric 'temp' value should raise ValueError.
    - A dictionary missing the 'windSpeed' key should raise ValueError.
    - A dictionary with a non-numeric 'windSpeed' value should raise ValueError.
    '''
    valid_data = {'temp': 70, 'windSpeed': 5}
    assert validate_request_data(valid_data) == True

    with pytest.raises(ValueError):
        validate_request_data({'windSpeed': 5})

    with pytest.raises(ValueError):
        validate_request_data({'temp': 'warm', 'windSpeed': 5})

    with pytest.raises(ValueError):
        validate_request_data({'temp': 70})

    with pytest.raises(ValueError):
        validate_request_data({'temp': 70, 'windSpeed': 'breezy'})
