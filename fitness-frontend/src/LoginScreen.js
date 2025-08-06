import React, { useState } from "react";

// LoginScreen handles login, signup toggle, and password reset flows
export default function LoginScreen({ onLogin, onSwitchToSignup }) {
  // form fields for login/signup
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // control whether to show "forgot password" form
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPass, setResetPass]   = useState("");
  const [message, setMessage]       = useState("");

  // toggle between login and signup
  const [showSignup, setShowSignup] = useState(false);

  // handle login or signup submission
  const submit = (e) => {
    e.preventDefault();
    if (showSignup) {
      onSwitchToSignup(email, password);
    } else {
      onLogin(email, password);
    }
  };

  // send password reset request to backend
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          new_password: resetPass
        }),
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setMessage(data.message || "Password reset, check your email");
      } catch {
        setMessage("Server returned invalid response. Please try again.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  };

  // return to login view and clear reset/signup state
  const handleBackToLogin = () => {
    setShowForgot(false);
    setShowSignup(false);
    setResetEmail("");
    setResetPass("");
    setMessage("");
  };

  return (
    <div className="login-container">
      {showForgot ? (
        // Forgot Password form
        <>
          <h2>Reset Password</h2>
          <form onSubmit={handleForgotSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={resetPass}
              onChange={e => setResetPass(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
          {message && <p>{message}</p>}
          <button type="button" onClick={handleBackToLogin}>
            Back to Login
          </button>
        </>
      ) : showSignup ? (
        // Signup form
        <>
          <h2>Sign Up</h2>
          <form className="login-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Sign Up
            </button>
          </form>
          <p className="signup-text">
            Already have an account?{" "}
            <span className="signup-link" onClick={handleBackToLogin}>
              Log In
            </span>
          </p>
        </>
      ) : (
        // Default Login form
        <>
          <h2>Log In</h2>
          <form className="login-form" onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            <span
              className="signup-link"
              onClick={() => {
                setShowSignup(true);
                setShowForgot(false);
              }}
            >
              Sign Up
            </span>
          </p>
        </>
      )}
    </div>
  );
}
