import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function UserDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const payload = token ? parseJwt(token) : null;
    if (payload && payload.id) {
      fetch(`${backendUrl}/api/user/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setUserName(data.user.name);
            setUserEmail(data.user.email);
            setUserMobile(data.user.mobile);
            setUserAddress(data.user.address || '');
          }
        })
        .catch(() => {});
      // Fetch cart from backend
      fetch(`${backendUrl}/api/user/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          console.log('Cart API response:', data); // DEBUG
          if (!Array.isArray(data)) {
            setLoading(false);
            return;
          }
          // Filter out items with missing product
          const filtered = data.filter(item => item.product && item.product.name);
          if (filtered.length !== data.length) {
            // setCartMessage('Some cart items are missing product details.');
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    navigate('/');
  };

  const handleGoToCart = () => {
    navigate('/user/cart');
  };

  const handleGoToWishlist = () => {
    navigate('/user/wishlist');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome, {userName}!</h2>
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3>Your Profile</h3>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p><strong>Name:</strong> {editMode ? (
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '0.3em 0.7em', borderRadius: '4px', border: '1px solid #ccc' }} />
            ) : userName}</p>
            <p><strong>Email:</strong> {userEmail}</p>
            <p><strong>Mobile:</strong> {userMobile || '-'}</p>
            <p><strong>Address:</strong> {editMode ? (
              <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} style={{ padding: '0.3em 0.7em', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }} />
            ) : (userAddress || '-')}
            </p>
          </div>
          <div>
            {editMode ? (
              <>
                <button onClick={async () => {
                  const token = localStorage.getItem('user_token');
                  setProfileMessage('');
                  try {
                    const res = await fetch(`${backendUrl}/api/user/profile`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ name: editName, address: editAddress }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setProfileMessage(data.message || 'Error updating profile');
                      return;
                    }
                    setUserName(editName);
                    setUserAddress(editAddress);
                    setEditMode(false);
                    setProfileMessage('Profile updated!');
                    setTimeout(() => setProfileMessage(''), 1500);
                  } catch {
                    setProfileMessage('Server error');
                  }
                }} style={{ marginRight: '0.5em', padding: '0.3em 0.8em', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                <button onClick={() => { setEditMode(false); setEditName(userName); setEditAddress(userAddress); }} style={{ padding: '0.3em 0.8em', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => { setEditMode(true); setEditName(userName); setEditAddress(userAddress); }} style={{ padding: '0.3em 0.8em', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit Profile</button>
            )}
          </div>
        </div>
        {profileMessage && <div style={{ color: 'green', marginTop: '1rem' }}>{profileMessage}</div>}
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleGoToCart} style={{ marginBottom: '1rem', padding: '0.5em 1.2em', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            My Cart
          </button>
          <button onClick={handleGoToWishlist} style={{ marginBottom: '1rem', padding: '0.5em 1.2em', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            My Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;