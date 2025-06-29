import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function UserProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setIsValid(false);
      return;
    }
    fetch(`${backendUrl}/api/user/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsValid(true);
        } else {
          localStorage.removeItem('user_token');
          setIsValid(false);
        }
      })
      .catch(() => {
        localStorage.removeItem('user_token');
        setIsValid(false);
      });
  }, [backendUrl]);

  if (isValid === null) return null;
  if (!isValid) return <Navigate to="/user/login" replace />;
  return children;
}

export default UserProtectedRoute; 