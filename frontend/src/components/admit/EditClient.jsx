import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', dob: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/client/${id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data);
        setForm({
          name: data.name,
          email: data.email,
          dob: data.dob ? data.dob.slice(0, 10) : '',
          address: data.address || '',
        });
        setLoading(false);
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/client/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setClient(data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/client/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="auth-container">
      <h2>Edit Client details</h2>
      {editMode ? (
        <form onSubmit={handleUpdate}>
          <table style={{ width: '100%', margin: '1em 0', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Name</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Name"
                  />
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Email</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    disabled
                    placeholder="Email"
                  />
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Date of Birth</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    required
                    placeholder="Date of Birth"
                  />
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Address</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Address"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <table style={{ width: '100%', margin: '1em 0', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Name</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{client.name}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Email</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{client.email}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Date of Birth</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{client.dob ? client.dob.slice(0, 10) : ''}</td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Address</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{client.address}</td>
              </tr>
            </tbody>
          </table>
          <button onClick={() => setEditMode(true)}>Edit</button>
          <button onClick={handleDelete} style={{ marginLeft: '1em', color: 'red' }}>
            Delete
          </button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1em' }}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default EditClient; 