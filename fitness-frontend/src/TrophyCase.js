import React, { useState, useEffect } from "react";
import "./App.css";

import bronzemedal        from "./assets/images/bronzemedal.jpg";
import bronzemedallocked  from "./assets/images/bronzemedallocked.jpg";
import silvermedal        from "./assets/images/silvermedal.jpg";
import silvermedallocked  from "./assets/images/silvermedallocked.jpg";
import medal1             from "./assets/images/medal1.jpg";
import medal1locked       from "./assets/images/medal1locked.jpg";
import trophy1            from "./assets/images/trophy1.jpg";
import trophy1locked      from "./assets/images/trophy1locked.jpg";
import trophy2            from "./assets/images/trophy2.jpg";
import trophy2locked      from "./assets/images/trophy2locked.jpg";
import trophy3            from "./assets/images/trophy3.jpg";
import trophy3locked      from "./assets/images/trophy3locked.jpg";
import dumbbell           from "./assets/images/dumbbell.png";
import dumbbelllocked     from "./assets/images/dumbbelllocked.png";

const trophies = [
  { name: "First Workout",          img: bronzemedal,       lockedImg: bronzemedallocked,       desc: "Awarded for completing 1st workout" },
  { name: "Fifth Workout",          img: silvermedal,       lockedImg: silvermedallocked,       desc: "Awarded for completing 5th workout" },
  { name: "Tenth Workout",          img: medal1,            lockedImg: medal1locked,            desc: "Awarded for completing 10th workout" },
  { name: "Fiftieth Workout",       img: trophy1,           lockedImg: trophy1locked,           desc: "Awarded for completing 50th workout" },
  { name: "One Hundredth Workout",  img: trophy2,           lockedImg: trophy2locked,           desc: "Awarded for completing 100th workout" },
  { name: "Five Hundredth Workout", img: trophy3,           lockedImg: trophy3locked,           desc: "Awarded for completing 500th workout" },
  { name: "5 Day Streak",           img: dumbbell,          lockedImg: dumbbelllocked,          desc: "Awarded for 5 day streak." },
];

// how many workouts needed for each trophy
const thresholds = [1, 5, 10, 50, 100, 500, 5];

export default function TrophyCase({ userEmail }) {
  const [index, setIndex]         = useState(0);
  const [workouts, setWorkouts]   = useState([]);

  const { name, img, lockedImg, desc } = trophies[index];

  useEffect(() => {
    if (!userEmail) return;
    fetch(`/api/dashboard?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => setWorkouts(data))
      .catch(console.error);
  }, [userEmail]);

  // count only workouts with at least one exercise
  const completedWorkouts = workouts.filter((w) => w.exercises.length > 0).length;
  const isLocked = completedWorkouts < thresholds[index];

  const displayImg  = isLocked ? lockedImg : img;
  const displayName = isLocked ? "Not unlocked" : name;
  const displayDesc = isLocked ? "Keep working out to unlock!" : desc;

  const prev = () => setIndex((i) => (i - 1 + trophies.length) % trophies.length);
  const next = () => setIndex((i) => (i + 1) % trophies.length);

  return (
    <div className="trophy-container">
      <div className="exercise-image-container">
        <img src={displayImg} alt={displayName} className="exercise-image" />
      </div>
      <div className="trophy-nav">
        <button className="nav-button" onClick={prev}>&lt;</button>
        <span className="trophy-name">{displayName}</span>
        <button className="nav-button" onClick={next}>&gt;</button>
      </div>
      <div className="trophy-desc">{displayDesc}</div>
    </div>
  );
}
