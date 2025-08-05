// src/Dashboard.js
import React, { useState, useEffect } from "react";

import "./App.css";

export default function Dashboard({ userEmail }) {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/dashboard?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => setWorkouts(data))
      .catch(console.error);
  }, [userEmail]);

  // workouts with at least one exercise
  const validWorkouts = workouts.filter((w) => w.exercises.length > 0);

  if (workouts.length === 0) {
    return <p className="dashboard-empty">No workouts logged yet.</p>;
  }
  if (validWorkouts.length === 0) {
    return <p className="dashboard-empty">No exercises recorded yet.</p>;
  }

  return (
    <div className="dashboard-container">
      {validWorkouts.map((w) => (
        <div key={w.workout_id} className="workout-card">
          <h3>
            Workout – {" "}
            {new Date(w.date).toLocaleString()}
          </h3>
          <ul>
            {w.exercises.map((ex, i) => (
              <li key={i} className="exercise-entry">
                <strong>{ex.name}</strong> — {ex.sets}×{ex.reps}
                {ex.weight !== null && <> @ {ex.weight}</>}
                {ex.notes && (
                  <div className="entry-notes">Notes: {ex.notes}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
