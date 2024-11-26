from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# Load the model and label encoder
model = joblib.load('best_model.pkl')
encoder = joblib.load('label_encoder.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict the class based on input features.
    Expects a JSON payload with 21 numeric inputs in the range [0-3].
    """
    try:
        # Parse input JSON
        input_data = request.json
        if not input_data:
            return jsonify({"error": "No input data provided"}), 400

        # Validate input length
        features = input_data.get("features")
        if len(features) != 21:
            return jsonify({"error": "Input must contain exactly 21 features"}), 400
        
        # Convert features to NumPy array
        sample_input = np.array([features])  # Shape (1, 21)

        # Make prediction
        encoded_prediction = model.predict(sample_input)
        decoded_prediction = encoder.inverse_transform(encoded_prediction)

        # Return the result
        return jsonify({"predicted_class": decoded_prediction[0]})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
