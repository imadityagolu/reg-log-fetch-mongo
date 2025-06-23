import { useEffect, useState } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [cartProductIds, setCartProductIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/product')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch cart product IDs from backend
  const fetchCartProductIds = () => {
    const token = localStorage.getItem('user_token');
    if (!token) return;
    fetch('http://localhost:5000/api/user/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCartProductIds(data.map(item => item.product?._id).filter(Boolean));
        }
      });
  };

  useEffect(() => {
    const loggedIn = !!localStorage.getItem('user_token');
    setUserLoggedIn(loggedIn);
    if (loggedIn) fetchCartProductIds();
    const handleStorage = () => {
      const isLoggedIn = !!localStorage.getItem('user_token');
      setUserLoggedIn(isLoggedIn);
      if (isLoggedIn) fetchCartProductIds();
      else setCartProductIds([]);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line
  }, []);

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
      fetchCartProductIds();
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', background: '#f7f7f7', minHeight: '100vh', paddingTop: '6rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 700, letterSpacing: 1 }}>All Products</h2>
        {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        {loading ? (
          <div style={{ textAlign: 'center' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center' }}>No products found.</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {products.map(product => {
              const inCart = cartProductIds.includes(product._id);
              return (
                <div
                  key={product._id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'box-shadow 0.2s',
                    position: 'relative',
                  }}
                >
                  {/* Placeholder for product image */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    background: '#e9ecef',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: '#adb5bd',
                  }}>
                    <span role="img" aria-label="product">🛒</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', textAlign: 'center' }}>{product.name}</div>
                  <div style={{ color: '#6c757d', fontSize: '0.95rem', marginBottom: '0.5rem', textAlign: 'center', minHeight: '40px' }}>{product.description}</div>
                  <div style={{ color: '#495057', fontSize: '0.95rem', marginBottom: '0.5rem' }}><b>Category:</b> {product.category}</div>
                  <div style={{ color: '#007bff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>₹{product.price}</div>
                  {userLoggedIn && (
                    <button
                      onClick={() => inCart ? navigate('/user/cart') : handleAddToCart(product)}
                      style={{ padding: '0.7em 1.5em', background: inCart ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: inCart ? 'pointer' : 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: inCart ? 'none' : '0 2px 8px rgba(0,123,255,0.08)', transition: 'background 0.2s' }}
                    >
                      {inCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default AllProducts; 