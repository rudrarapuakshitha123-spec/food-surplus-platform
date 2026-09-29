import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/users').then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (id) => {
    await api.put(`/users/${id}/toggle`);
    load();
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="container">
      <h2>Manage Users</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--gray-200)' }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}>Area</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Joined</th>
              <th style={{ padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <td style={{ padding: 8 }}>{u.name}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}><span className="badge badge-available">{u.role}</span></td>
                <td style={{ padding: 8 }}>{u.areaCode}</td>
                <td style={{ padding: 8 }}>
                  <span className={`badge ${u.isActive ? 'badge-available' : 'badge-expired'}`}>
                    {u.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
                <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => toggle(u._id)}>
                    {u.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
