from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

load_dotenv()


def get_db_connection():
    connect = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
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


@app.route("/api/register", methods=['POST'])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", '')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # encryption code
    hashed_pw = generate_password_hash(password)

    connect = get_db_connection()
    cursor = connect.cursor()

    try:
        cursor.execute("INSERT INTO Users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_pw))
        connect.commit()

    except mysql.connector.errors.IntegrityError:
        return jsonify({"message": "User already exists"}), 409

    cursor.close()
    connect.close()

    return jsonify({"message": "User registered successful!"}), 201


@app.route("/api/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    connect = get_db_connection()
    cursor = connect.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
    user = cursor.fetchone()

    cursor.close()
    connect.close()

    if not user:
        return jsonify({"message": "User does not exist"}), 404

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid password"}), 401

    return jsonify({"message": "Login successful!", "user_id": user["id"]}), 200


@app.route("/api/workouts", methods=["GET"])
def get_workouts():
    connect = get_db_connection()
    cursor = connect.cursor(dictionary=True)
    cursor.execute("SELECT id FROM Workouts;")
    rows = cursor.fetchall()
    cursor.close()
    connect.close()
    return jsonify(rows), 200


@app.route("/api/exercises", methods=["POST"])
def add_exercise():
    # get data sent to frontend
    data = request.get_json()
    print("📥 Received from frontend:", data)

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
    import sys

    if "test" in sys.argv:
        import unittest

        class TestCases(unittest.TestCase):
            def setUp(self):
                self.app = app.test_client()

            # test with missing data
            def testAPI(self):
                response = self.app.get('/api/data')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json, {"message": "Data send via connection"})

            # normal test
            def testDBtables(self):
                response = self.app.get('/testdb')
                self.assertEqual(response.status_code, 200)
                self.assertIn("tables", response.json)

            # test adding exercise
            def testAddExercise(self):
                response = self.app.post('/api/workouts', json={})
                self.assertEqual(response.status_code, 400)
                self.assertIn("workout_id must be provided", response.json["message"])

        unittest.main(argv=['first-arg-is-ignored'], exit=False)

    else:
        app.run(host="127.0.0.1", port=5000, debug=True)
