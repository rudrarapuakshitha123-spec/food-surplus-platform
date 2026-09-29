import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

const TABS = ['all', 'available', 'reserved', 'completed', 'expired'];

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings/my/all')
      .then((res) => setListings(res.data.listings))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? listings : listings.filter((l) => l.status === tab);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Listings</h2>
        <Link to="/listings/create" className="btn btn-primary">+ New Listing</Link>
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No listings in this category yet.</div>
      ) : (
        <div className="grid-3">
          {filtered.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
        </div>
      )}
    </div>
  );
};

export default MyListings;
