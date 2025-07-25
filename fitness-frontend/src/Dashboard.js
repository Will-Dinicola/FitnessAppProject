import React, { useEffect, useState } from "react";
import "./App.css";

export default function Dashboard({ userId = 1 }) {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch(`/api/dashboard?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setWorkouts(data))
      .catch(console.error);
  }, [userId]);

  if (workouts.length === 0) {
    return <p className="dashboard-empty">No workouts logged yet.</p>;
  }

  return (
    <div className="dashboard-container">
      {workouts.map(w => (
        <div key={w.workout_id} className="workout-card">
          <h3>Workout #{w.workout_id}</h3>
          {w.exercises.length === 0 ? (
            <p><em>No exercises recorded.</em></p>
          ) : (
            <ul>
              {w.exercises.map((ex, i) => (
                <li key={i} className="exercise-entry">
                  <strong>{ex.name}</strong> — {ex.sets}×{ex.reps}
                  {ex.weight ? ` @ ${ex.weight}` : ""}  
                  {ex.notes && <div className="entry-notes">Notes: {ex.notes}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
