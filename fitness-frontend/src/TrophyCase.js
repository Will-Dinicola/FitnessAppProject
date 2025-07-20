import React, { useState } from "react";
import "./App.css";

import bronzemedal from "./assets/images/bronzemedal.jpg";
import bronzemedallocked from "./assets/images/bronzemedallocked.jpg";
import silvermedal from "./assets/images/silvermedal.jpg";
import silvermedallocked from "./assets/images/silvermedallocked.jpg";
import medal1 from "./assets/images/medal1.jpg";
import medal1locked from "./assets/images/medal1locked.jpg";
import trophy1 from "./assets/images/trophy1.jpg";
import trophy1locked from "./assets/images/trophy1locked.jpg";
import trophy2 from "./assets/images/trophy2.jpg";
import trophy2locked from "./assets/images/trophy2locked.jpg";
import trophy3 from "./assets/images/trophy3.jpg";
import trophy3locked from "./assets/images/trophy3locked.jpg";
import dumbbell from "./assets/images/dumbbell.png";
import dumbbelllocked from "./assets/images/dumbbelllocked.png";

const trophies = [
  {
    name: "First Workout",
    img: bronzemedal,
    lockedImg: bronzemedallocked,
    desc: "Awarded for completing 1st workout",
  },
  {
    name: "Fifth Workout",
    img: silvermedal,
    lockedImg: silvermedallocked,
    desc: "Awarded for completing 5th workout",
  },
    {
    name: "Tenth Workout",
    img: medal1,
    lockedImg: medal1locked,
    desc: "Awarded for completing 10th workout",
  },
      {
    name: "Fiftieth Workout",
    img: trophy1,
    lockedImg: trophy1locked,
    desc: "Awarded for completing 50th workout",
  },
        {
    name: "One Hundreth Workout",
    img: trophy2,
    lockedImg: trophy2locked,
    desc: "Awarded for completing 100th workout",
  },
  
        {
    name: "Five Hundreth Workout",
    img: trophy3,
    lockedImg: trophy3locked,
    desc: "Awarded for completing 500th workout",
  },
  
  
  {
    name: "5 Day Streak",
    img: dumbbell,
    lockedImg: dumbbelllocked,
    desc: "Awarded for 5 day streak.",
  },
];

export default function TrophyCase() {
  const [index, setIndex] = useState(0);
  const { name, img, lockedImg, desc } = trophies[index];

  const prev = () => setIndex((index - 1 + trophies.length) % trophies.length);
  const next = () => setIndex((index + 1) % trophies.length);

  //This is dummy logic, will fix once we figure out db issue
  const unlockedTrophies = [0,1,2,3];
  const isLocked = !unlockedTrophies.includes(index);

  const displayImg  = isLocked ? lockedImg : img;
  const displayName = isLocked ? "Not unlocked" : name;
  const displayDesc = isLocked
    ? "Keep working out to unlock!"
    : desc;

  return (
    <div className="trophy-container">
      <h2>Trophy Case</h2>

      <div className="exercise-image-container">
        <img
          src={displayImg}
          alt={displayName}
          className="exercise-image"
        />
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