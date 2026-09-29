import { useNotifications } from '../context/NotificationContext';

const typeIcons = {
  new_listing: '🥗',
  reservation_update: '📋',
  listing_expiring: '⚠️',
  listing_expired: '⚠️',
  system: '🔔'
};

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Notifications</h2>
        <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>Mark all read</button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">No notifications yet.</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className="card"
            onClick={() => !n.isRead && markAsRead(n._id)}
            style={{
              marginBottom: 10,
              cursor: n.isRead ? 'default' : 'pointer',
              borderLeft: n.isRead ? 'none' : '4px solid var(--green-500)',
              fontWeight: n.isRead ? 400 : 700,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}
          >
            <span style={{ fontSize: 20 }}>{typeIcons[n.type] || '🔔'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)', display: 'inline-block' }} />}
                <strong>{n.title}</strong>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 400, color: 'var(--gray-500)' }}>{n.message}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 400, color: 'var(--gray-500)' }}>
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationsPage;
