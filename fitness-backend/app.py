from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def get_db_connection():
    connect = mysql.connector.connect(
        host="localhost",
        user="user_name",
        password="user_password",
        database="FitnessAppDB"
    )
    return connect

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/data")
def get_data():
    return jsonify({"message": "Data send via connection"})

if __name__ == "__main__":
    app.run(debug=False)