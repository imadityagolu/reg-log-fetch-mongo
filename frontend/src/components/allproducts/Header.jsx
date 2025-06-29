import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Header() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    setLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Listen for login/logout changes in localStorage
    const handleStorage = () => {
      setLoggedIn(!!localStorage.getItem('user_token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eee', marginBottom: 0, overflowX: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 3rem' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          <Link to="/">E-Comm</Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {loggedIn ? (
            <>
              <Link to="/user/dashboard" style={{ textDecoration: 'none', color: '#fff', background: '#28a745', padding: '0.5em 1em', borderRadius: '4px', minWidth: '90px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <span role="img" aria-label="profile">👤</span> Profile
              </Link>
              <Link to="/user/wishlist" style={{ textDecoration: 'none', color: '#fff', background: '#ffc107', padding: '0.5em 1.2em', borderRadius: '4px', minWidth: '100px', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <span role="img" aria-label="wishlist">❤️</span> Wishlist
              </Link>
              <Link to="/user/cart" style={{ textDecoration: 'none', color: '#fff', background: '#007bff', padding: '0.5em 1.5em', borderRadius: '4px', minWidth: '100px', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <span role="img" aria-label="cart">🛒</span> My Cart
              </Link>
            </>
          ) : (
            <Link to="/user/login" style={{ textDecoration: 'none', color: '#fff', background: '#28a745', padding: '0.5em 1em', borderRadius: '4px', minWidth: '90px', textAlign: 'center' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 