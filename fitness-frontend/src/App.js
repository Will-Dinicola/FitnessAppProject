import { useState, useEffect } from "react";

function TestFunction() {
    // This line sets data to null, and says that setData will be the setter
    const [data, setData] = useState(null);

    // useEffect takes 2 args: 1st is the function to run, 2nd is when to re-run it
    useEffect(() => {
        // First arg: fetch data, convert to JSON, then set state
        fetch("http://localhost:5000/api/data")
            .then((res) => res.json())
            .then((data) => setData(data.message));
    }, []); // Second arg: empty array = run only once

    // Line reads: if data is true, show it; else show "Not loaded"
    return <div>{data ? data : "Not loaded"}</div>;
}

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
    const [chosen, setChosen] = useState(exercises[0]);
  
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
  
    const handleExercise = (exercise) => {
      setSelectedExercise(exercise);
      console.log("Exercise chosen:", exercise);
      // TODO: integrate with workout state or API call here
    };
  
    return (
      <div className="App">
        <h1>Fitness App</h1>
        <TestFunction />
        <ExerciseSelector onSelect={handleExercise} />
        {selectedExercise && (
          <p className="selected-display">
            Selected exercise: <strong>{selectedExercise}</strong>
          </p>
        )}
      </div>
    );
  }
export default App;