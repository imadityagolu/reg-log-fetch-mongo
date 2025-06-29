import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function ClientDashboard() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientDetails, setClientDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Get client name from token
    const token = localStorage.getItem('client_token');
    const payload = token ? parseJwt(token) : null;
    if (payload && payload.id) {
      fetch(`${backendUrl}/api/client/${payload.id}`)
        .then(res => res.json())
        .then(data => {
          setClientName(data.name || '');
          setClientDetails(data);
        });
    }
    // Fetch products for this client
    if (token) {
      fetch(`${backendUrl}/api/product/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setProducts(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    navigate('/');
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setEditPrice(product.price);
    setEditDescription(product.description);
    setEditError('');
    setEditSuccess('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditPrice('');
    setEditDescription('');
    setEditError('');
    setEditSuccess('');
  };

  const saveEdit = async (id) => {
    setEditError('');
    setEditSuccess('');
    try {
      const token = localStorage.getItem('client_token');
      const res = await fetch(`${backendUrl}/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price: editPrice, description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setEditSuccess('Product updated!');
      setProducts(products.map(p => p._id === id ? data.product : p));
      setTimeout(cancelEdit, 1000);
    } catch (err) {
      setEditError(err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('client_token');
      const res = await fetch(`${backendUrl}/api/product/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Welcome, {clientName ? clientName : 'Client'}!</h2>
      <button onClick={handleLogout}>Logout</button>
      <br /><br />
      {clientDetails && (
        <div style={{ background: '#f7f7f7', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', maxWidth: '500px' }}>
          <div><b>Email:</b> {clientDetails.email}</div>
          <div><b>Mobile:</b> {clientDetails.mobile}</div>
          <div><b>Date of Birth:</b> {clientDetails.dob ? clientDetails.dob.slice(0, 10) : '-'}</div>
          <div><b>Address:</b> {clientDetails.address}</div>
          <div><b>Account Created:</b> {clientDetails.createdAt ? clientDetails.createdAt.slice(0, 10) : '-'}</div>
          <div><b>Last Login:</b> {clientDetails.lastLogin ? clientDetails.lastLogin.slice(0, 19).replace('T', ' ') : '-'}</div>
        </div>
      )}
      <button onClick={() => navigate('/client/addproduct')}>Add Product</button>
      <h3 style={{ marginTop: '2rem' }}>Your Products</h3>
      {loading ? (
        <div>Loading...</div>
      ) : products.length === 0 ? (
        <div>No products added yet.</div>
      ) : (
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Image</th>
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
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px', background: 'white' }}>
                    {product.image ? (
                      <img
                        src={product.image.startsWith('/uploads/') ? backendUrl + product.image : product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span role="img" aria-label="product" style={{ fontSize: '2rem', color: '#adb5bd' }}>📦</span>
                    )}
                  </div>
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {editId === product._id ? (
                    <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                  ) : (
                    product.description
                  )}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.category}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {editId === product._id ? (
                    <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                  ) : (
                    product.price
                  )}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{product.createdAt ? product.createdAt.slice(0, 10) : ''}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {editId === product._id ? (
                    <>
                      <button onClick={() => saveEdit(product._id)}>Save</button>
                      <button onClick={cancelEdit} style={{ marginLeft: '0.5em' }}>Cancel</button>
                      {editError && <div style={{ color: 'red' }}>{editError}</div>}
                      {editSuccess && <div style={{ color: 'green' }}>{editSuccess}</div>}
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(product)}>Edit</button>
                      <button onClick={() => deleteProduct(product._id)} style={{ marginLeft: '0.5em', color: 'red' }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClientDashboard; 