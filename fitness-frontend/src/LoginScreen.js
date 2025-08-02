import React, { useState } from "react";

export default function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New states for forgot password form
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

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

      const text = await res.text(); // safer for debugging

      try {
        const data = JSON.parse(text);
        setMessage(data.message || "Password reset, check your email");
      } catch (err) {
        console.error("Server did not return valid JSON:", text);
        setMessage("Server returned invalid response. Please try again.");
      }
    } catch (err) {
      console.error("Network or server error:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    setResetEmail("");
    setResetPass("");
    setMessage("");
    setShowForgot(false);
  };

  return (
    <div className="login-container">
      {!showForgot ? (
        <>
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
            <span className="signup-link" onClick={onSwitchToSignup}>
              Sign Up
            </span>
          </p>
        </>
      ) : (
        <>
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

          <button type="button" onClick={handleBackToLogin}>
            Back to Login
          </button>
        </>
      )}
    </div>
  );
}
