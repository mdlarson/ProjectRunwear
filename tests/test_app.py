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
from runwear.app import app


@pytest.fixture
def client():
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


def test_get_clothing_valid(client):
    '''
    GIVEN a Flask application configured for testing
    WHEN the '/getClothing' route is posted with valid temperature and wind speed JSON data
    THEN check that the response contains the expected 'imageUrls' and the status code is 200
    '''
    valid_data = {'temp': 70, 'windSpeed': 5}
    response = client.post('/getClothing', json=valid_data)
    assert response.status_code == 200
    data = response.get_json()
    assert 'imageUrls' in data
    assert isinstance(data['imageUrls'], list)  # Ensure it returns a list


def test_get_clothing_invalid_data(client):
    '''
    GIVEN a Flask application configured for testing
    WHEN the '/getClothing' route is posted with invalid data types for temperature and wind speed
    THEN check that the response status is 400 and contains an appropriate error message
    '''
    invalid_data = {'temp': 'cool', 'windSpeed': 'breezy'}
    response = client.post('/getClothing', json=invalid_data)
    assert response.status_code == 400
    assert 'Invalid data types provided' in response.get_json()['error']
