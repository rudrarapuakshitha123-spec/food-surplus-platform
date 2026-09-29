import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

const CATEGORIES = ['produce', 'bakery', 'dairy', 'meat', 'prepared', 'canned', 'beverages', 'other'];

const ListingsPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [areaCode, setAreaCode] = useState(user.areaCode || '');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings', {
          params: { areaCode: areaCode || undefined, category: category || undefined, page, limit: 12 }
        });
        setListings(res.data.listings);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [areaCode, category, page]);

  return (
    <div className="container">
      <h2>Browse Available Food</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Area code</label>
            <input value={areaCode} onChange={(e) => { setAreaCode(e.target.value); setPage(1); }} placeholder="e.g. 500081" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--gray-500)' }}>{total} listing{total !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="loading">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">No listings match your filters.</div>
      ) : (
        <div className="grid-3">
          {listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ alignSelf: 'center', fontSize: 14 }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
