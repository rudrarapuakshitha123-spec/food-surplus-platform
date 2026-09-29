import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, phone: user.phone || '', areaCode: user.areaCode, address: user.address || ''
  });
  const [prefs, setPrefs] = useState(user.notificationPreferences || { email: true, realtime: true });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const initials = user.name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', { ...form, notificationPreferences: prefs });
      updateUser({ ...user, ...res.data.user });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <h2>Profile Settings</h2>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--green-700)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700,
            margin: '0 auto 8px'
          }}>{initials}</div>
          <strong>{user.name}</strong>
          <p style={{ margin: '4px 0', color: 'var(--gray-500)', fontSize: 14 }}>{user.email} · {user.role}</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Area code</label>
            <input value={form.areaCode} onChange={(e) => setForm({ ...form, areaCode: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={prefs.email} onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })} />
              Email notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={prefs.realtime} onChange={(e) => setPrefs({ ...prefs, realtime: e.target.checked })} />
              Real-time alerts
            </label>
          </div>

          <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
