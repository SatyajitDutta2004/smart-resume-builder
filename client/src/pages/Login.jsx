import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchJSON } from '../api.js';

export default function Login({ onAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleEmail, setGoogleEmail] = useState('demo.user@gmail.com');
  const [googleName, setGoogleName] = useState('Demo User');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState('');

  const isLoginDisabled = loading === 'password' || !email.trim() || !password.trim();
  const isGoogleDisabled = loading === 'google' || !googleName.trim() || !googleEmail.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setGoogleError('');
    setLoading('password');

    try {
      const data = await fetchJSON('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const handleGoogleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setGoogleError('');

    const cleanName = googleName.trim();
    const cleanEmail = googleEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setGoogleError('Enter a display name and Gmail address, or use the prefilled demo account.');
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(cleanEmail)) {
      setGoogleError('Enter a valid Gmail address ending with @gmail.com.');
      return;
    }

    setLoading('google');
    try {
      const data = await fetchJSON('/auth/google-login', {
        method: 'POST',
        body: { email: cleanEmail, name: cleanName },
      });
      onAuth(data.token, data.user);
    } catch (err) {
      setGoogleError(err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-header">
        <h2>Welcome back</h2>
        <p>Sign in to access your resume builder, AI analysis, and export tools.</p>
      </div>

      <div className="auth-grid">
        <form onSubmit={handleSubmit} className="auth-card">
          <h3>Account login</h3>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
            />
          </label>
          <button type="submit" disabled={isLoginDisabled}>
            {loading === 'password' ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>

        <form className="auth-card oauth-panel" onSubmit={handleGoogleLogin}>
          <h3>Demo Google sign-in</h3>
          <p className="field-hint">
            This demo sign-in simulates Google authentication by creating or reusing an account with your email.
          </p>
          <label>
            Display name
            <input
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              placeholder="Your display name"
              required
            />
          </label>
          <label>
            Email address
            <input
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              type="email"
              placeholder="demo.user@gmail.com"
              required
            />
          </label>
          <button type="submit" className="secondary" disabled={isGoogleDisabled}>
            {loading === 'google' ? 'Signing in...' : 'Continue with demo Google'}
          </button>
          {googleError && <div className="error-message">{googleError}</div>}
        </form>
      </div>

      <div className="auth-footer">
        <div className="auth-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <span>·</span>
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </section>
  );
}
