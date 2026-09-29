import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ReservationsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(user.role === 'donor' ? 'incoming' : 'my');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const endpoint = tab === 'my' ? '/reservations/my' : '/reservations/incoming';
    api.get(endpoint)
      .then((res) => setReservations(res.data.reservations))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const updateStatus = async (id, status) => {
    await api.put(`/reservations/${id}`, { status });
    load();
  };

  return (
    <div className="container">
      <h2>Reservations</h2>

      {user.role === 'donor' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`btn btn-sm ${tab === 'incoming' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('incoming')}>Incoming</button>
        </div>
      )}
      {user.role === 'recipient' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`btn btn-sm ${tab === 'my' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('my')}>My Reservations</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">No reservations yet.</div>
      ) : (
        reservations.map((r) => (
          <div key={r._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to={`/listings/${r.listing?._id}`}><strong>{r.listing?.title}</strong></Link>
              <span className={`badge badge-${r.status}`}>{r.status}</span>
            </div>
            <p style={{ margin: '8px 0', fontSize: 14, color: 'var(--gray-500)' }}>
              {tab === 'my' ? `Donor: ${r.donor?.name}` : `Recipient: ${r.recipient?.name}`}
              {' · '}Pickup: {new Date(r.pickupTime).toLocaleString()}
            </p>
            {r.notes && <p style={{ fontSize: 14 }}>Notes: {r.notes}</p>}

            {r.status === 'pending' && tab === 'incoming' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'confirmed')}>Confirm</button>
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, 'cancelled')}>Cancel</button>
              </div>
            )}
            {r.status === 'confirmed' && tab === 'incoming' && (
              <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'completed')}>Mark Complete</button>
            )}
            {r.status === 'pending' && tab === 'my' && (
              <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, 'cancelled')}>Cancel</button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReservationsPage;
