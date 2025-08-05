from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os
from collections import defaultdict

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

@app.route("/api/register", methods=['POST'])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    hashed_pw = generate_password_hash(password)
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO Users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_pw)
        )
        conn.commit()
    except mysql.connector.errors.IntegrityError:
        cursor.close()
        conn.close()
        return jsonify({"message": "User already exists"}), 409

    cursor.close()
    conn.close()
    return jsonify({"message": "User registered successful!"}), 201

@app.route("/api/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"message": "User does not exist"}), 404
    if user.get("is_disabled"):
        return jsonify({"message": "Account disabled"}), 403
    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful!",
        "user_id": user["id"],
        "role":    user.get("role", "member")
    }), 200

def require_admin(email):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT role FROM Users WHERE email = %s", (email,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row and row.get("role") == "admin"

@app.route("/api/users", methods=["GET"])
def list_users():
    admin_email = request.args.get("email")
    if not require_admin(admin_email):
        return jsonify({"message": "Forbidden"}), 403

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, name, email, role, is_disabled, created_at
        FROM Users
        ORDER BY created_at DESC
    """)
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users), 200

@app.route("/api/users/<int:uid>", methods=["DELETE"])
def delete_user(uid):
    admin_email = request.args.get("email")
    if not require_admin(admin_email):
        return jsonify({"message": "Forbidden"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Users WHERE id = %s", (uid,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "User deleted"}), 200

@app.route("/api/users/<int:uid>/disable", methods=["PATCH"])
def toggle_disable(uid):
    admin_email = request.args.get("email")
    if not require_admin(admin_email):
        return jsonify({"message": "Forbidden"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Users SET is_disabled = NOT is_disabled WHERE id = %s",
        (uid,)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "User disable toggled"}), 200

@app.route("/api/users/<int:uid>/role", methods=["PATCH"])
def change_role(uid):
    admin_email = request.args.get("email")
    if not require_admin(admin_email):
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json()
    new_role = data.get("role")
    if new_role not in ("member", "admin"):
        return jsonify({"message": "Invalid role"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Users SET role = %s WHERE id = %s",
        (new_role, uid)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Role updated"}), 200

@app.route("/api/workouts", methods=['POST'])
def create_workout():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Users WHERE email = %s", (email,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return jsonify({"message": "User not found"}), 404
    user_id = row[0]

    cursor.execute("INSERT INTO Workouts (user_id) VALUES (%s)", (user_id,))
    conn.commit()
    workout_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({"workout_id": workout_id}), 201

@app.route("/api/exercises", methods=["POST"])
def add_exercise():
    data = request.get_json()
    workout_id = data.get("workout_id")
    name       = data.get("name")
    sets       = data.get("sets")
    reps       = data.get("reps")
    weight     = data.get("weight")
    notes      = data.get("notes")

    if not workout_id or not name:
        return jsonify({"message": "Workout ID and name are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Exercises (workout_id, name, sets, reps, weight, notes) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (workout_id, name, sets, reps, weight, notes)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Exercise logged successfully!"}), 201

@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    email        = data.get("email")
    new_password = data.get("new_password")
    if not email or not new_password:
        return jsonify({"message": "Email and new password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id FROM Users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        conn.close()
        return jsonify({"message": "Email not found"}), 404

    hashed_password = generate_password_hash(new_password)
    cursor.execute(
        "UPDATE Users SET password = %s WHERE email = %s",
        (hashed_password, email)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Password updated successfully"}), 200

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email is required"}), 400

    conn = get_db_connection()
    cur  = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT
            W.id   AS workout_id,
            W.date AS workout_date,
            E.id   AS exercise_id,
            E.name AS exercise_name,
            E.sets,
            E.reps,
            E.weight,
            E.notes
        FROM Workouts W
        JOIN Users U ON U.id = W.user_id
        LEFT JOIN Exercises E ON E.workout_id = W.id
        WHERE U.email = %s
        ORDER BY W.date DESC, E.id;
    """, (email,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    grouped = defaultdict(lambda: {"date": None, "exercises": []})
    for r in rows:
        wid = r["workout_id"]
        if grouped[wid]["date"] is None:
            grouped[wid]["date"] = r["workout_date"]
        if r["exercise_id"] is not None:
            grouped[wid]["exercises"].append({
                "id":     r["exercise_id"],
                "name":   r["exercise_name"],
                "sets":   r["sets"],
                "reps":   r["reps"],
                "weight": r["weight"],
                "notes":  r["notes"],
            })

    result = [
        {"workout_id": wid, "date": info["date"], "exercises": info["exercises"]}
        for wid, info in grouped.items()
    ]
    return jsonify(result), 200

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
