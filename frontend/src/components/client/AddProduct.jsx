import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('client_token');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const res = await fetch(`${backendUrl}/api/product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Add product failed');
      setSuccess('Product added successfully!');
      setTimeout(() => navigate('/client/dashboard'), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ textAlign: 'center' }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
        <br /><br />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files[0])}
        />
        <br /><br />
        <button type="submit">Add Product</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button onClick={() => navigate('/client/dashboard')} style={{ marginTop: '1em' }}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default AddProduct; 