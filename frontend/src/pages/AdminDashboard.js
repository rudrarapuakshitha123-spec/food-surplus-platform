import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;

  const maxCount = Math.max(1, ...(stats.categoryBreakdown.map((c) => c.count)));

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
      </div>

      <div className="grid-4" style={{ margin: '20px 0' }}>
        <div className="card stat-card"><div className="value">{stats.totalListings}</div><div className="label">Total Listings</div></div>
        <div className="card stat-card"><div className="value">{stats.activeListings}</div><div className="label">Active</div></div>
        <div className="card stat-card"><div className="value">{stats.completedListings}</div><div className="label">Completed Donations</div></div>
        <div className="card stat-card"><div className="value">{stats.totalUsers}</div><div className="label">Total Users</div></div>
      </div>

      <div className="card">
        <h3>Category Breakdown</h3>
        {stats.categoryBreakdown.map((c) => (
          <div key={c._id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
              <span>{c._id}</span><span>{c.count}</span>
            </div>
            <div style={{ background: 'var(--gray-200)', borderRadius: 6, height: 10 }}>
              <div style={{
                width: `${(c.count / maxCount) * 100}%`,
                background: 'var(--green-700)',
                height: '100%',
                borderRadius: 6
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
