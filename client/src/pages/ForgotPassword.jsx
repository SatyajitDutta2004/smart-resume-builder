import { useState } from 'react';
import { fetchJSON } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const data = await fetchJSON('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setMessage(data.message || 'If the email exists, a reset token was generated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-panel">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <button type="submit">Request Reset</button>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
      <p>After requesting a reset, use your token on the reset page.</p>
    </section>
  );
}
