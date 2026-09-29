import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">🥗 Food Surplus</Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/listings" onClick={() => setMenuOpen(false)}>Browse</Link>
          {user.role === 'donor' && (
            <>
              <Link to="/my-listings" onClick={() => setMenuOpen(false)}>My Listings</Link>
              <Link to="/listings/create" onClick={() => setMenuOpen(false)}>Donate Food</Link>
            </>
          )}
          <Link to="/reservations" onClick={() => setMenuOpen(false)}>Reservations</Link>
          {user.role === 'admin' && (
            <>
              <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
              <Link to="/admin/users" onClick={() => setMenuOpen(false)}>Users</Link>
            </>
          )}
          <Link to="/notifications" className="navbar-bell" onClick={() => setMenuOpen(false)}>
            🔔 {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>{user.name.split(' ')[0]}</Link>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
