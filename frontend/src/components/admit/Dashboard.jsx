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
  const [adminDetails, setAdminDetails] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Get admin name from token
    const token = localStorage.getItem('token');
    const payload = token ? parseJwt(token) : null;
    if (payload && payload.id) {
      fetch(`${backendUrl}/api/admit/${payload.id}`)
        .then(res => res.json())
        .then(data => {
          setAdminName(data.name || '');
          setAdminDetails(data);
        });
    }
    fetch(`${backendUrl}/api/client`)
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${backendUrl}/api/client/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setClients(clients.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, {adminName ? adminName : 'Admin'}!</h2>
      <button onClick={handleLogout}>Logout</button>
      {adminDetails && (
        <div style={{ background: '#f7f7f7', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', maxWidth: '500px' }}>
          <div><b>Email:</b> {adminDetails.email}</div>
          <div><b>Mobile:</b> {adminDetails.mobile}</div>
          <div><b>Account Created:</b> {adminDetails.createdAt ? adminDetails.createdAt.slice(0, 10) : '-'}</div>
          <div><b>Last Login:</b> {adminDetails.lastLogin ? adminDetails.lastLogin.slice(0, 19).replace('T', ' ') : '-'}</div>
        </div>
      )}
      <h3>All Clients</h3>
      <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Mobile</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date of Birth</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Address</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Account Created</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Last Login</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.email}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.mobile}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.dob ? client.dob.slice(0, 10) : '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.address}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.createdAt ? client.createdAt.slice(0, 10) : '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{client.lastLogin ? client.lastLogin.slice(0, 19).replace('T', ' ') : '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <button onClick={() => navigate(`/dashboard/client/${client._id}`)}>View</button>
                <button onClick={() => deleteClient(client._id)} style={{ marginLeft: '0.5em', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdmitDashboard; 