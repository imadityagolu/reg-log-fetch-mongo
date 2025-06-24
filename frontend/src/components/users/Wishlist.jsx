import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cartProductIds, setCartProductIds] = useState([]);
  const navigate = useNavigate();

  const fetchWishlist = () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('http://localhost:5000/api/user/wishlist', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setWishlist(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
    // Fetch cart product IDs
    const token = localStorage.getItem('user_token');
    if (token) {
      fetch('http://localhost:5000/api/user/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCartProductIds(data.map(item => item.product?._id).filter(Boolean));
          }
        });
    }
    // eslint-disable-next-line
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    const token = localStorage.getItem('user_token');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/user/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Error removing from wishlist');
        setTimeout(() => setMessage(''), 1500);
        return;
      }
      setMessage('Removed from wishlist!');
      setTimeout(() => setMessage(''), 1500);
      fetchWishlist();
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('user_token');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Error adding to cart');
        setTimeout(() => setMessage(''), 1500);
        return;
      }
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 1500);
      setCartProductIds(prev => [...prev, product._id]);
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 700 }}>My Wishlist</h2>
      {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Your wishlist is empty.</div>
      ) : (
        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ padding: '1em', borderBottom: '1px solid #eee', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1em', borderBottom: '1px solid #eee', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '1em', borderBottom: '1px solid #eee', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '1em', borderBottom: '1px solid #eee', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '1em', borderBottom: '1px solid #eee', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.map(product => (
              <tr key={product._id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                <td style={{ padding: '1em', fontWeight: 600 }}>{product.name}</td>
                <td style={{ padding: '1em', color: '#6c757d', minWidth: '180px' }}>{product.description}</td>
                <td style={{ padding: '1em' }}>{product.category}</td>
                <td style={{ padding: '1em', color: '#007bff', fontWeight: 700 }}>₹{product.price}</td>
                <td style={{ padding: '1em', textAlign: 'center' }}>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    style={{ padding: '0.5em 1em', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(220,53,69,0.08)', transition: 'background 0.2s', marginRight: '0.5em' }}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => cartProductIds.includes(product._id) ? navigate('/user/cart') : handleAddToCart(product)}
                    style={{ padding: '0.5em 1em', background: cartProductIds.includes(product._id) ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: cartProductIds.includes(product._id) ? 'pointer' : 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,123,255,0.08)', transition: 'background 0.2s' }}
                  >
                    {cartProductIds.includes(product._id) ? 'In Cart' : 'Add to Cart'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Wishlist; 