import React, { useState } from 'react';
import './App.css';

export default function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = e => {
    e.preventDefault();
    onLogin(email, password);
  };

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
      <p className="signup-text">
        Don’t have an account?{' '}
        <span className="signup-link" onClick={onSwitchToSignup}>
          Sign Up
        </span>
      </p>
    </div>
  );
}
