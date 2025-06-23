import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('client_token', data.token);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <h2>Client Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br></br><br></br>
        <input
          type="password"
          placeholder="Enter Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br></br><br></br>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        Don't have an account? <a href="/client/register">Register as Client</a>
      </p>
      <Link to="/admit/login">Login as Admin</Link>
    </div>
  );
}

export default ClientLogin; 