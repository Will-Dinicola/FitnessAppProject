import React, { useState } from "react";
import "./App.css";

import blankImg         from "./assets/images/blank.jpg";
import pushUpImg        from "./assets/images/push-up.jpg";
import squatImg         from "./assets/images/squat.jpg";
import benchPressImg    from "./assets/images/bench-press.jpg";
import deadliftImg      from "./assets/images/deadlift.jpg";
import overheadPressImg from "./assets/images/overhead-press.jpg";
import pullUpImg        from "./assets/images/pull-up.jpg";
import lungeImg         from "./assets/images/lunge.jpg";
import plankImg         from "./assets/images/plank.jpg";
import bicepCurlImg     from "./assets/images/bicep-curl.jpg";
import tricepDipImg     from "./assets/images/tricep-dip.jpg";

function ExerciseSelector({ onSelect }) {
  const exercises = [
    "Push-Up",
    "Squat",
    "Bench Press",
    "Deadlift",
    "Overhead Press",
    "Pull-Up",
    "Lunge",
    "Plank",
    "Bicep Curl",
    "Tricep Dip",
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
        onChange={(e) => setChosen(e.target.value)}
        className="exercise-select"
      >
        <option value="">-- none --</option>
        {exercises.map((ex) => (
          <option key={ex} value={ex}>
            {ex}
          </option>
        ))}
      </select>
      <button
        className="select-button"
        onClick={() => onSelect(chosen)}
      >
        Select Exercise
      </button>
    </div>
  );
}

function App() {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");

  const exerciseImages = {
    "Push-Up": pushUpImg,
    Squat: squatImg,
    "Bench Press": benchPressImg,
    Deadlift: deadliftImg,
    "Overhead Press": overheadPressImg,
    "Pull-Up": pullUpImg,
    Lunge: lungeImg,
    Plank: plankImg,
    "Bicep Curl": bicepCurlImg,
    "Tricep Dip": tricepDipImg,
  };

  const handleExercise = (exercise) => {
    setSelectedExercise(exercise);
    // reset reps/notes when you change exercise
    setReps("");
    setNotes("");
  };

  // pick blank or the selected image
  const currentImage =
    selectedExercise && exerciseImages[selectedExercise]
      ? exerciseImages[selectedExercise]
      : blankImg;

  return (
    <div className="App">
      <h1>Fitness App</h1>

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
              onChange={(e) => setReps(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder=""
            />
          </div>

          <button
            className="save-button"
            onClick={() => {
              console.log({
                exercise: selectedExercise,
                reps,
                notes,
              });
            }}
          >
            Save Entry
          </button>
        </>
      )}
    </div>
  );
}

export default App;
