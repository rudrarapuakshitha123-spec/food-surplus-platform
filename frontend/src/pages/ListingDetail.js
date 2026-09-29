import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/listings/${id}`)
      .then((res) => setListing(res.data.listing))
      .catch(() => setError('Listing not found'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleReserve = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.post('/reservations', { listingId: id, pickupTime, notes });
      setSuccess('Reserved! Check the Reservations page for updates.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve this listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  if (loading) return <div className="loading">Loading listing...</div>;
  if (!listing) return <div className="container empty-state">Listing not found.</div>;

  const isOwner = listing.donor?._id === user.id;

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{listing.title}</h2>
          <span className={`badge badge-${listing.status}`}>{listing.status}</span>
        </div>

        <p style={{ color: 'var(--gray-500)', marginTop: 12 }}>{listing.description}</p>

        <div className="grid-2" style={{ margin: '16px 0' }}>
          <div><strong>Category:</strong> {listing.category}</div>
          <div><strong>Quantity:</strong> {listing.quantity} {listing.unit}</div>
          <div><strong>Area code:</strong> {listing.areaCode}</div>
          <div><strong>Expires:</strong> {new Date(listing.expiresAt).toLocaleString()}</div>
          <div><strong>Pickup address:</strong> {listing.address}</div>
          <div><strong>Donor:</strong> {listing.donor?.name}</div>
        </div>

        {listing.allergens?.length > 0 && (
          <p><strong>Allergens:</strong> {listing.allergens.join(', ')}</p>
        )}
        {listing.isOrganic && <p>🌱 Organic</p>}
        {listing.pickupInstructions && (
          <p><strong>Pickup instructions:</strong> {listing.pickupInstructions}</p>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {isOwner && (
          <button className="btn btn-danger" onClick={handleDelete}>Delete Listing</button>
        )}

        {!isOwner && user.role === 'recipient' && listing.status === 'available' && (
          <form onSubmit={handleReserve} style={{ marginTop: 20, borderTop: '1px solid var(--gray-200)', paddingTop: 20 }}>
            <h3>Reserve this listing</h3>
            <div className="form-group">
              <label>Pickup time</label>
              <input type="datetime-local" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Reserving...' : 'Reserve'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
