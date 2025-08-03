from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

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

    hashed_pw = generate_password_hash(password)

    connect = get_db_connection()
    cursor = connect.cursor()

    try:
        cursor.execute("INSERT INTO Users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_pw))
        connect.commit()
    except mysql.connector.errors.IntegrityError:
        cursor.close()
        connect.close()
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


@app.route("/api/workouts", methods=['POST'])
def create_workout():
    data = request.get_json()
    user_id = data.get("user_id", 1)  # replace with real user logic

    connect = get_db_connection()
    cursor = connect.cursor()

    cursor.execute("INSERT INTO Workouts (user_id) VALUES (%s)", (user_id,))
    connect.commit()
    workout_id = cursor.lastrowid

    cursor.close()
    connect.close()

    return jsonify({"workout_id": workout_id}), 201


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
    data = request.get_json()
    print("📥 Received from frontend:", data)

    workout_id = data.get("workout_id")
    name = data.get("name")
    sets = data.get("sets")
    reps = data.get("reps")
    weight = data.get("weight")
    notes = data.get("notes")

    if not workout_id or not name:
        return jsonify({"message": "Workout or name must be provided"}), 400

    connect = get_db_connection()
    cursor = connect.cursor()

    cursor.execute(
        "INSERT INTO Exercises (workout_id, name, sets, reps, weight, notes) VALUES (%s, %s, %s, %s, %s, %s);",
        (workout_id, name, sets, reps, weight, notes)
    )
    connect.commit()

    cursor.close()
    connect.close()

    return jsonify({"message": "Exercise logged successfully!"})


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    email = data.get("email")
    new_password = data.get("new_password")

    if not email or not new_password:
        return jsonify({"message": "Email and new password required"}), 400

    connect = get_db_connection()
    cursor = connect.cursor(dictionary=True)

    try:
        cursor.execute("SELECT id FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "Email not found"}), 404

        hashed_password = generate_password_hash(new_password)

        cursor.execute(
            "UPDATE Users SET password = %s WHERE email = %s",
            (hashed_password, email)
        )
        connect.commit()

    except Exception as e:
        print("Error during password reset:", e)
        return jsonify({"message": "Internal server error"}), 500

    finally:
        cursor.close()
        connect.close()

    return jsonify({"message": "Password updated successfully"}), 200


if __name__ == "__main__":
    import sys

    if "test" in sys.argv:
        import unittest

        class TestCases(unittest.TestCase):
            def setUp(self):
                self.app = app.test_client()

            def testAPI(self):
                response = self.app.get('/api/data')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json, {"message": "Data send via connection"})

            def testDBtables(self):
                response = self.app.get('/testdb')
                self.assertEqual(response.status_code, 200)
                self.assertIn("tables", response.json)

            def testAddExercise(self):
                response = self.app.post('/api/workouts', json={})
                self.assertEqual(response.status_code, 400)
                self.assertIn("workout_id must be provided", response.json["message"])

        unittest.main(argv=['first-arg-is-ignored'], exit=False)

    else:
        app.run(host="127.0.0.1", port=5000, debug=True)
