import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', dob: '', address: '' });
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendUrl}/api/client/${id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data);
        setForm({
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          dob: data.dob ? data.dob.slice(0, 10) : '',
          address: data.address || '',
        });
        setLoading(false);
      });
    // Fetch products by this client
    fetch(`${backendUrl}/api/product`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data.filter(p => p.client && (p.client._id === id || p.client === id)));
        }
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${backendUrl}/api/client/${id}`, {
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
      const res = await fetch(`${backendUrl}/api/client/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      // No auth required for admin in this context
      const res = await fetch(`${backendUrl}/api/product/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.message);
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
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Mobile</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    placeholder="Mobile"
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
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Mobile</th>
                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{client.mobile}</td>
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
      <h3 style={{ marginTop: '2em' }}>Products Added by this Client</h3>
      {products.length === 0 ? (
        <div>No products added by this client.</div>
      ) : (
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Description</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Category</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Price</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Created At</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.description}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.category}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.price}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.createdAt ? product.createdAt.slice(0, 10) : ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  <button onClick={() => deleteProduct(product._id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EditClient; 