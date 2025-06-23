import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function AdmitDashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    // Get admin name from token
    const token = localStorage.getItem('token');
    const payload = token ? parseJwt(token) : null;
    if (payload && payload.id) {
      fetch(`http://localhost:5000/api/admit/${payload.id}`)
        .then(res => res.json())
        .then(data => setAdminName(data.name || ''));
    }
    fetch('http://localhost:5000/api/client')
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, {adminName ? adminName : 'Admin'}!</h2>
      <button onClick={handleLogout}>Logout</button>
      <h3>All Clients</h3>
      <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.email}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <button onClick={() => navigate(`/dashboard/client/${client._id}`)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdmitDashboard; 