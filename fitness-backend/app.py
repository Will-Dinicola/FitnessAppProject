from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/data")
def get_data():
    return jsonify({"message": "Data send via connection"})

if __name__ == "__main__":
    app.run(debug=False)