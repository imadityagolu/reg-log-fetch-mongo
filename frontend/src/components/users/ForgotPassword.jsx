import React, { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: otp+password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage('If this email is registered, you will receive an OTP.');
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successful! You can now log in.');
        setStep(3);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Forgot Password</h2>
      {message && <div style={{ color: 'green', textAlign: 'center', marginBottom: 12 }}>{message}</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{error}</div>}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="otp" style={{ display: 'block', marginBottom: 8 }}>OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="newPassword" style={{ display: 'block', marginBottom: 8 }}>New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
      {step === 3 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/user/login" style={{ color: '#007bff', textDecoration: 'underline' }}>Go to Login</a>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword; 