import React, { useState, useEffect } from "react";
import "./App.css";

import LoginScreen from "./LoginScreen";
import TrophyCase  from "./TrophyCase";
import Dashboard   from "./Dashboard";

import blankImg          from "./assets/images/blank.jpg";
import pushUpImg         from "./assets/images/push-up.jpg";
import squatImg          from "./assets/images/squat.jpg";
import benchPressImg     from "./assets/images/bench-press.jpg";
import deadliftImg       from "./assets/images/deadlift.jpg";
import overheadPressImg  from "./assets/images/overhead-press.jpg";
import pullUpImg         from "./assets/images/pull-up.jpg";
import lungeImg          from "./assets/images/lunge.jpg";
import plankImg          from "./assets/images/plank.jpg";
import bicepCurlImg      from "./assets/images/bicep-curl.jpg";
import tricepDipImg      from "./assets/images/tricep-dip.jpg";

function ExerciseSelector({ onSelect }) {
  const exercises = [
    "Push-Up","Squat","Bench Press","Deadlift",
    "Overhead Press","Pull-Up","Lunge","Plank",
    "Bicep Curl","Tricep Dip",
  ];
  const [chosen, setChosen] = useState("");
  return (
    <div className="selector-container">
      <label htmlFor="exercise" className="selector-label">
        Choose an exercise:
      </label>
      <select
        id="exercise"
        value={chosen}
        onChange={e => setChosen(e.target.value)}
        className="exercise-select"
      >
        <option value="">-- none --</option>
        {exercises.map(ex => (
          <option key={ex} value={ex}>{ex}</option>
        ))}
      </select>
      <button className="select-button" onClick={() => onSelect(chosen)}>
        Select Exercise
      </button>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [userEmail, setUserEmail]       = useState("");
  const [view, setView]                 = useState("workout");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [reps, setReps]                 = useState("");
  const [weight, setWeight]             = useState("");
  const [notes, setNotes]               = useState("");
  const [workoutId, setWorkoutId]       = useState(null);

  const exerciseImages = {
    "Push-Up": pushUpImg, Squat: squatImg, "Bench Press": benchPressImg,
    Deadlift: deadliftImg, "Overhead Press": overheadPressImg,
    "Pull-Up": pullUpImg, Lunge: lungeImg, Plank: plankImg,
    "Bicep Curl": bicepCurlImg, "Tricep Dip": tricepDipImg,
  };

  const handleExercise = exercise => {
    const img = exerciseImages[exercise];
    if (exercise && img) {
      console.log(`Selected exercise: ${exercise}`);
      console.log(`Image displayed: ${img.split("/").pop()}`);
      console.log("Inputs visible: Reps field, Weight field, Notes textarea");
    } else {
      console.error("FAIL");
    }
    setSelectedExercise(exercise);
    setReps("");
    setWeight("");
    setNotes("");
  };

  const currentImage = selectedExercise && exerciseImages[selectedExercise]
    ? exerciseImages[selectedExercise]
    : blankImg;

  useEffect(() => {
    if (!userEmail) return;
    fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail })
    })
      .then(res => res.json())
      .then(data => setWorkoutId(data.workout_id))
      .catch(console.error);
  }, [userEmail]);

  const handleSave = async () => {
    try {
      const payload = {
        workout_id: workoutId,
        name:       selectedExercise,
        sets:       1,
        reps:       parseInt(reps, 10),
        weight:     weight ? parseFloat(weight) : null,
        notes,
      };
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const { message } = await res.json();
      alert(message);
      setSelectedExercise("");
      setReps("");
      setWeight("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("ERROR: " + err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <h1>Fitness App</h1>
        <LoginScreen
          onLogin={async (email, password) => {
            const res = await fetch("/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
              alert("Login failed: " + data.message);
              return;
            }
            setIsLoggedIn(true);
            setUserEmail(email);
          }}
          onSwitchToSignup={async (email, password) => {
            const res = await fetch("/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
              alert("Signup failed: " + data.message);
              return;
            }
            setIsLoggedIn(true);
            setUserEmail(email);
          }}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="logout-container">
        <button
          className="view-button"
          onClick={() => {
            setIsLoggedIn(false);
            setUserEmail("");
            setView("workout");
          }}
        >
          Logout
        </button>
      </div>

      {view === "workout" && (
        <>
          <h1>Exercise Log</h1>
          <div className="view-buttons">
            <button
              className="view-button"
              onClick={() => setView("trophies")}
            >
              Trophies
            </button>
            <button
              className="view-button"
              onClick={() => setView("dashboard")}
            >
              Dashboard
            </button>
          </div>
          <ExerciseSelector onSelect={handleExercise} />
          <div className="exercise-image-container">
            <img
              src={currentImage}
              alt={selectedExercise || "No exercise selected"}
              className="exercise-image"
            />
          </div>
          {selectedExercise && (
            <>
              <p className="selected-display">
                Selected exercise: <strong>{selectedExercise}</strong>
              </p>
              <div className="input-group">
                <label htmlFor="reps">Reps:</label>
                <input
                  id="reps"
                  type="number"
                  min="1"
                  value={reps}
                  onChange={e => setReps(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="weight">Weight:</label>
                <input
                  id="weight"
                  type="number"
                  min="0"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="notes">Notes:</label>
                <textarea
                  id="notes"
                  rows="3"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How did it feel?"
                />
              </div>
              <button
                className="save-button"
                onClick={handleSave}
                disabled={!selectedExercise || !reps || workoutId === null}
              >
                Save Entry
              </button>
            </>
          )}
        </>
      )}
      {view === "trophies" && (
        <>
          <h1>Trophy Case</h1>
          <div className="view-buttons">
            <button
              className="view-button"
              onClick={() => setView("workout")}
            >
              Workout
            </button>
            <button
              className="view-button"
              onClick={() => setView("dashboard")}
            >
              Dashboard
            </button>
          </div>
          <TrophyCase userEmail={userEmail}/>
        </>
      )}
      {view === "dashboard" && (
        <>
          <h1>Dashboard</h1>
          <div className="view-buttons">
            <button
              className="view-button"
              onClick={() => setView("workout")}
            >
              Workout
            </button>
            <button
              className="view-button"
              onClick={() => setView("trophies")}
            >
              Trophies
            </button>
          </div>
          <Dashboard userEmail={userEmail} />
        </>
      )}
    </div>
  );
}

export default App;
