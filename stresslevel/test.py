import requests

# URL of the Flask app endpoint
url = "http://127.0.0.1:5000/predict"

# Example input features for testing
test_data = {
    "features": [2, 0, 1, 3, 3, 2, 1, 3, 0, 1, 2, 3, 1, 2, 0, 1, 0, 1, 2, 1, 0]
}

# Send a POST request with the test data
response = requests.post(url, json=test_data)

# Print the response
if response.status_code == 200:
    print("Prediction result:")
    print(response.json())
else:
    print(f"Error: {response.status_code}")
    print(response.json())
