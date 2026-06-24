import { useState } from 'react';
import { fetchJSON } from '../api.js';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const data = await fetchJSON('/auth/reset-password', {
        method: 'POST',
        body: { email, token, newPassword },
      });
      setMessage(data.message || 'Password reset successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-panel">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Reset Token
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
        </label>
        <label>
          New password
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" minLength={6} required />
        </label>
        <button type="submit">Reset Password</button>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </section>
  );
}
