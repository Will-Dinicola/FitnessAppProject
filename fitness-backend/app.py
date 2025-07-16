from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
import mysql.connector

app = Flask(__name__)
CORS(app)


def get_db_connection():
    connect = mysql.connector.connect(
        host="caboose.proxy.rlwy.net",
        port=53416,
        user="root",
        password="hmYWITDjgmkOYDFBOjApTdkMdkOIhGRD",
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

