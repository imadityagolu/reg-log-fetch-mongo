import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/product`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(p => p._id === id);
          if (found) {
            setProduct(found);
          } else {
            setError('Product not found');
          }
        } else {
          setError('Product not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching product');
        setLoading(false);
      });
    // Check login and fetch cart/wishlist
    const token = localStorage.getItem('user_token');
    setUserLoggedIn(!!token);
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
      fetch('http://localhost:5000/api/user/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setWishlistProductIds(data.map(item => item._id));
          }
        });
    }
  }, [id]);

  const handleAddToCart = async () => {
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

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('user_token');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Error adding to wishlist');
        setTimeout(() => setMessage(''), 1500);
        return;
      }
      setMessage('Added to wishlist!');
      setTimeout(() => setMessage(''), 1500);
      setWishlistProductIds(prev => [...prev, product._id]);
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  const handleRemoveFromWishlist = async () => {
    const token = localStorage.getItem('user_token');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/user/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Error removing from wishlist');
        setTimeout(() => setMessage(''), 1500);
        return;
      }
      setMessage('Removed from wishlist!');
      setTimeout(() => setMessage(''), 1500);
      setWishlistProductIds(prev => prev.filter(pid => pid !== product._id));
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'red' }}>{error}</div>;
  if (!product) return null;

  const inCart = cartProductIds.includes(product._id);
  const inWishlist = wishlistProductIds.includes(product._id);

  return (
    <>
      <Header />
      <div style={{ maxWidth: '600px', margin: '7rem auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {product.image ? (
            <img
              src={product.image.startsWith('/uploads/') ? backendUrl + product.image : product.image}
              alt={product.name}
              style={{ width: '250px', height: '250px', objectFit: 'contain', borderRadius: '12px', background: 'white' }}
            />
          ) : (
            <span role="img" aria-label="product" style={{ fontSize: '4rem', color: '#adb5bd' }}>📦</span>
          )}
        </div>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>{product.name}</h2>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}><b>Description:</b> {product.description}</div>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}><b>Category:</b> {product.category}</div>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#007bff', fontWeight: 700 }}><b>Price:</b> ₹{product.price}</div>
        <div style={{ marginBottom: '1rem', color: '#888', fontSize: '1.05rem' }}>
          <b>Listed by:</b> {product.client && typeof product.client === 'object' && product.client.name ? product.client.name : 'Unknown'}
        </div>
        {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        {userLoggedIn && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
            <button
              onClick={inCart ? () => navigate('/user/cart') : handleAddToCart}
              style={{ padding: '0.7em 1.5em', background: inCart ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,123,255,0.08)', transition: 'background 0.2s' }}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            {inWishlist ? (
              <button
                onClick={handleRemoveFromWishlist}
                style={{ padding: '0.7em 1.2em', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(220,53,69,0.08)', transition: 'background 0.2s' }}
              >
                Remove from Wishlist
              </button>
            ) : (
              <button
                onClick={handleAddToWishlist}
                style={{ padding: '0.7em 1.2em', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(255,193,7,0.08)', transition: 'background 0.2s' }}
              >
                Add to Wishlist
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ProductDetails; 