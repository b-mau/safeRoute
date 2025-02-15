from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf  # Assuming TensorFlow model
import requests

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Load your trained neural network model
model = tf.keras.models.load_model("safe_route_model.h5")  # Change to your model path

# Function to get the safest waypoint
def get_safest_waypoint(start, end):
    # Convert input coordinates to a model-friendly format
    input_data = np.array([[start["lat"], start["lng"], end["lat"], end["lng"]]])
    
    # Get the model's predicted safest waypoint
    prediction = model.predict(input_data)  # Model should output lat, lng
    waypoint = {"lat": float(prediction[0][0]), "lng": float(prediction[0][1])}
    
    return waypoint

@app.route("/get_waypoint", methods=["POST"])
def get_waypoint():
    data = request.json
    start = data.get("start")
    end = data.get("end")

    if not start or not end:
        return jsonify({"error": "Missing start or end location"}), 400

    # Get safest waypoint
    waypoint = get_safest_waypoint(start, end)

    return jsonify({"waypoint": waypoint})

if __name__ == "__main__":
    app.run(debug=True)
