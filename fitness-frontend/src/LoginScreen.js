import React, { useState } from "react";

export default function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [message, setMessage] = useState("");

  // new state for signup mode
  const [showSignup, setShowSignup] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (showSignup) {
      onSwitchToSignup(email, password);
    } else {
      onLogin(email, password);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail, new_password: resetPass }),
    });
    const data = await res.json();
    setMessage(data.message || "Check your email");
  };

  if (showForgot) {
    return (
      <div className="login-container">
        <h2>Reset Password</h2>
        <form onSubmit={handleForgotSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={resetPass}
            onChange={(e) => setResetPass(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p>{message}</p>}
        <button type="button" onClick={() => setShowForgot(false)}>
          Back to Login
        </button>
      </div>
    );
  }

  if (showSignup) {
    return (
      <div className="login-container">
        <h2>Sign Up</h2>
        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Sign Up
          </button>
        </form>
        <p className="signup-text">
          Already have an account?{" "}
          <span className="signup-link" onClick={() => setShowSignup(false)}>
            Log In
          </span>
        </p>
      </div>
    );
  }

  // default: login form
  return (
    <div className="login-container">
      <h2>Log In</h2>
      <form className="login-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>

      <button
        type="button"
        className="forgot-password-btn"
        onClick={() => setShowForgot(true)}
      >
        Forgot Password?
      </button>

      <p className="signup-text">
        Don’t have an account?{" "}
        <span className="signup-link" onClick={() => setShowSignup(true)}>
          Sign Up
        </span>
      </p>
    </div>
  );
}
