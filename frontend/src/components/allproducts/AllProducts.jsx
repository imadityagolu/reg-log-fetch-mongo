import { useEffect, useState } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [cartProductIds, setCartProductIds] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5000";

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

  // Fetch wishlist product IDs from backend
  const fetchWishlistProductIds = () => {
    const token = localStorage.getItem('user_token');
    if (!token) return;
    fetch('http://localhost:5000/api/user/wishlist', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlistProductIds(data.map(item => item._id));
        }
      });
  };

  useEffect(() => {
    const loggedIn = !!localStorage.getItem('user_token');
    setUserLoggedIn(loggedIn);
    if (loggedIn) {
      fetchCartProductIds();
      fetchWishlistProductIds();
    }
    const handleStorage = () => {
      const isLoggedIn = !!localStorage.getItem('user_token');
      setUserLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        fetchCartProductIds();
        fetchWishlistProductIds();
      } else {
        setCartProductIds([]);
        setWishlistProductIds([]);
      }
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

  const handleAddToWishlist = async (product) => {
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
      fetchWishlistProductIds();
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  const handleRemoveFromWishlist = async (product) => {
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
      fetchWishlistProductIds();
    } catch {
      setMessage('Server error');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: '2rem', background: '#f7f7f7', minHeight: '100vh', paddingTop: '6rem' }}>
        <h2 style={{ marginLeft:'100px', marginBottom: '2rem', fontWeight: 700, letterSpacing: 1 }}>All Products</h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, description, or category..."
            style={{ width: '80%', padding: '0.7em 1.2em', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>
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
            {products.filter(product => {
              const q = search.trim().toLowerCase();
              if (!q) return true;
              return (
                (product.name && product.name.toLowerCase().includes(q)) ||
                (product.description && product.description.toLowerCase().includes(q)) ||
                (product.category && product.category.toLowerCase().includes(q))
              );
            }).map(product => {
              const inCart = cartProductIds.includes(product._id);
              const inWishlist = wishlistProductIds.includes(product._id);
              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
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
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'white',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: '#adb5bd',
                  }}>
                    {product.image ? (
                      <img
                        src={product.image.startsWith('/uploads/') ? backendUrl + product.image : product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span role="img" aria-label="product">📦</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', textAlign: 'center' }}>{product.name}</div>
                  <div style={{ color: '#6c757d', fontSize: '0.95rem', marginBottom: '0.5rem', textAlign: 'center', minHeight: '40px' }}>{
                    (() => {
                      if (!product.description) return '';
                      const words = product.description.split(' ');
                      if (words.length <= 10) return product.description;
                      return words.slice(0, 10).join(' ') + '...';
                    })()
                  }</div>
                  <div style={{ color: '#495057', fontSize: '0.95rem', marginBottom: '0.5rem' }}><b>Category:</b> {product.category}</div>
                  <div style={{ color: '#007bff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>₹{product.price}</div>
                  {userLoggedIn && (
                    <div style={{ display: 'flex', gap: '0.5em', marginBottom: '0.5em' }}>
                      <button
                        onClick={() => inCart ? navigate('/user/cart') : handleAddToCart(product)}
                        style={{ padding: '0.7em 1.5em', background: inCart ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: inCart ? 'pointer' : 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: inCart ? 'none' : '0 2px 8px rgba(0,123,255,0.08)', transition: 'background 0.2s' }}
                      >
                        {inCart ? 'In Cart' : 'Add to Cart'}
                      </button>
                      {inWishlist ? (
                        <button
                          onClick={() => handleRemoveFromWishlist(product)}
                          style={{ padding: '0.7em 1.2em', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(220,53,69,0.08)', transition: 'background 0.2s' }}
                        >
                          Remove from Wishlist
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          style={{ padding: '0.7em 1.2em', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(255,193,7,0.08)', transition: 'background 0.2s' }}
                        >
                          Add to Wishlist
                        </button>
                      )}
                    </div>
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