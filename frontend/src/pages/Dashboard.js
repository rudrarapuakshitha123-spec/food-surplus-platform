import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [donorStats, setDonorStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'donor') {
          const res = await api.get('/analytics/donor');
          setDonorStats(res.data);
        } else if (user.role === 'recipient') {
          const res = await api.get('/listings', { params: { areaCode: user.areaCode, limit: 6 } });
          setRecentListings(res.data.listings);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="container">
      <div className="dashboard-greeting">
        <h2>Hi, {user.name.split(' ')[0]} 👋</h2>
        <p>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} · Area {user.areaCode}</p>
      </div>

      {user.role === 'donor' && (
        <>
          <div className="dashboard-actions">
            <Link to="/listings/create" className="btn btn-primary">+ Donate Food</Link>
          </div>
          {loading ? (
            <div className="loading">Loading your stats...</div>
          ) : (
            <div className="grid-4">
              <div className="card stat-card"><div className="value">{donorStats?.total ?? 0}</div><div className="label">Total Listings</div></div>
              <div className="card stat-card"><div className="value">{donorStats?.active ?? 0}</div><div className="label">Active</div></div>
              <div className="card stat-card"><div className="value">{donorStats?.completed ?? 0}</div><div className="label">Completed</div></div>
              <div className="card stat-card"><div className="value">{donorStats?.expired ?? 0}</div><div className="label">Expired</div></div>
            </div>
          )}
        </>
      )}

      {user.role === 'recipient' && (
        <>
          <h3>Latest food in your area</h3>
          {loading ? (
            <div className="loading">Loading listings...</div>
          ) : recentListings.length === 0 ? (
            <div className="empty-state">No available listings in your area right now. Check back soon!</div>
          ) : (
            <div className="grid-3">
              {recentListings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
            </div>
          )}
          <div className="dashboard-actions">
            <Link to="/listings" className="btn btn-secondary">Browse All Listings</Link>
          </div>
        </>
      )}

      {user.role === 'admin' && (
        <div className="card">
          <p>Welcome, Admin. Head to the <Link to="/admin">Admin Dashboard</Link> for platform-wide analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
