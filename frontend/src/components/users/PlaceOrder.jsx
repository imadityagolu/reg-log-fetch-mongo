import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function PlaceOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const products = location.state?.products || [];
  const total = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  const handleConfirmOrder = async () => {
    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load.');
      return;
    }
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Demo key, replace with your real key
      amount: total * 100, // in paise
      currency: 'INR',
      name: 'Ecommerce Demo',
      description: 'Order Payment',
      handler: async function (response) {
        // Save order in DB
        try {
          const token = localStorage.getItem('user_token');
          const orderRes = await fetch(`${backendUrl}/api/user/order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              products,
              total,
              paymentId: response.razorpay_payment_id,
            }),
          });
          if (!orderRes.ok) {
            alert('Payment succeeded but failed to record order. Please contact support.');
            return;
          }
          alert('Payment successful! Order placed.');
          navigate('/user/dashboard');
        } catch {
          alert('Payment succeeded but failed to record order. Please contact support.');
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#007bff',
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.08)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Order Summary</h2>
      {products.length === 0 ? (
        <div>No products to place order for.</div>
      ) : (
        <>
          <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Category</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.category}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', marginBottom: '2rem' }}>
            Total Amount: ₹{total}
          </div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button onClick={() => navigate('/user/dashboard')} style={{ padding: '0.5em 1.2em', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
        {products.length > 0 && (
          <button onClick={handleConfirmOrder} style={{ padding: '0.5em 1.2em', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            Confirm Order
          </button>
        )}
      </div>
    </div>
  );
}

export default PlaceOrder;