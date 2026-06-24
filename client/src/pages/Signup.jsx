import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJSON } from '../api.js';

export default function Signup({ onAuth }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await fetchJSON('/auth/signup', {
        method: 'POST',
        body: { name, email, password },
      });
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-panel">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
        </label>
        <button type="submit">Sign Up</button>
        {error && <div className="error-message">{error}</div>}
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}
