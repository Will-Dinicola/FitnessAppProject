from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
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


@app.route("/testdb")
def test_db():
    connect = get_db_connection()
    cursor = connect.cursor()
    cursor.execute("SHOW TABLES;")
    tables = cursor.fetchall()
    cursor.close()
    connect.close()
    return {"tables": [t[0] for t in tables]}


@app.route("/api/exercises", methods=["POST"])
def add_exercise():
    # get data sent to frontend
    data = request.get_json()
    print("📥 Received from frontend:", data) # to see what's sent to the frontend

    workout_id = data.get("workout_id")  # track this in frontend
    name = data.get("name")

    # add stuff to record sets, reps, weight
    sets = data.get("sets")
    reps = data.get("reps")
    weight = data.get("weight")
    notes = data.get("notes")

    if not workout_id or not name:
        return jsonify({"message": "Workout or name must be provided"}), 400

    # connect to DB
    connect = get_db_connection()
    cursor = connect.cursor()

    # insert into DB
    cursor.execute(
        "INSERT INTO Exercises (workout_id, name, sets, reps, weight, notes) VALUES (%s, %s, %s, %s, %s, %s);",
        (workout_id, name, sets, reps, weight, notes)
    )

    connect.commit()

    # close connection
    cursor.close()
    connect.close()

    # return success message
    return jsonify({"message": "Exercise logged successfully!"})


if __name__ == "__main__":
    app.run(debug=False)
