import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClientRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, dob, address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/client/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <h2>Client Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br></br><br></br>
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
          placeholder="Choose Your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />  
        <br></br><br></br>
        <label>D O B : </label>
        <input
          type="date"
          placeholder="Enter Your Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />
        <br></br><br></br>
        <textarea
          placeholder="Enter Your Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          rows={3}
        />
        <br></br><br></br> 
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <p>
        Already have an account? <a href="/client/login">Login</a>
      </p>
    </div>
  );
}

export default ClientRegister; 