import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ClientProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('client_token');
    if (!token) {
      setIsValid(false);
      return;
    }
    fetch(`${backendUrl}/api/client/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setIsValid(true);
        } else {
          localStorage.removeItem('client_token');
          setIsValid(false);
        }
      })
      .catch(() => {
        localStorage.removeItem('client_token');
        setIsValid(false);
      });
  }, []);

  if (isValid === null) return null;
  if (!isValid) return <Navigate to="/client/login" replace />;
  return children;
}

export default ClientProtectedRoute; 