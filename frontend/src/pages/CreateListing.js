import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = ['produce', 'bakery', 'dairy', 'meat', 'prepared', 'canned', 'beverages', 'other'];
const UNITS = ['kg', 'lbs', 'items', 'boxes', 'bags', 'liters', 'servings', 'portions'];

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'produce', quantity: '', unit: 'kg',
    expiresAt: '', areaCode: user.areaCode || '', address: user.address || '',
    allergens: '', isOrganic: false, pickupInstructions: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        allergens: form.allergens ? form.allergens.split(',').map((a) => a.trim()).filter(Boolean) : []
      };
      const res = await api.post('/listings', payload);
      navigate(`/listings/${res.data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h2>Donate Food</h2>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Expires at</label>
              <input type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Area code</label>
              <input name="areaCode" value={form.areaCode} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Pickup address</label>
              <input name="address" value={form.address} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Allergens (comma-separated)</label>
            <input name="allergens" value={form.allergens} onChange={handleChange} placeholder="nuts, dairy" />
          </div>
          <div className="form-group">
            <label>Pickup instructions</label>
            <textarea name="pickupInstructions" rows="2" value={form.pickupInstructions} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="isOrganic" checked={form.isOrganic} onChange={handleChange} style={{ width: 'auto' }} />
            <label style={{ margin: 0 }}>This food is organic</label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : 'Post Listing'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
