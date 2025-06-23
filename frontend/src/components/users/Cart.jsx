import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('http://localhost:5000/api/user/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          setCart([]);
          setCartMessage('Cart API did not return an array.');
          setLoading(false);
          return;
        }
        const filtered = data.filter(item => item.product && item.product.name);
        setCart(filtered);
        setLoading(false);
      })
      .catch(() => {
        setCartMessage('Failed to fetch cart.');
        setLoading(false);
      });
  }, []);

  const handleRemoveFromCart = async (productId) => {
    const token = localStorage.getItem('user_token');
    try {
      const res = await fetch('http://localhost:5000/api/user/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCartMessage(data.message || 'Error removing from cart');
        setTimeout(() => setCartMessage(''), 1500);
        return;
      }
      setCart(cart.filter(item => item.product && item.product._id !== productId));
      setCartMessage('Removed from cart!');
      setTimeout(() => setCartMessage(''), 1500);
    } catch {
      setCartMessage('Server error');
      setTimeout(() => setCartMessage(''), 1500);
    }
  };

  const handlePlaceOrder = () => {
    const products = cart.map(item => item.product).filter(Boolean);
    navigate('/user/placeorder', { state: { products } });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>My Cart</h2>
      {cartMessage && <div style={{ color: 'red', marginBottom: '1rem' }}>{cartMessage}</div>}
      {cart.length === 0 ? (
        <div>No products in your cart.</div>
      ) : (
        <>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Category</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Price</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item._id}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.product?.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.product?.category}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.product?.price}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <button onClick={() => handleRemoveFromCart(item.product._id)} style={{ padding: '0.3em 0.8em', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={handlePlaceOrder} style={{ padding: '0.5em 1.2em', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                Place Order
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cart; 