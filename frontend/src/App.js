import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListingsPage from './pages/ListingsPage';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import ReservationsPage from './pages/ReservationsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

// Guards a route: requires login, and optionally a specific set of roles
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/listings" element={<PrivateRoute><ListingsPage /></PrivateRoute>} />
        <Route path="/listings/:id" element={<PrivateRoute><ListingDetail /></PrivateRoute>} />
        <Route
          path="/listings/create"
          element={<PrivateRoute roles={['donor']}><CreateListing /></PrivateRoute>}
        />
        <Route
          path="/my-listings"
          element={<PrivateRoute roles={['donor']}><MyListings /></PrivateRoute>}
        />
        <Route path="/reservations" element={<PrivateRoute><ReservationsPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route
          path="/admin"
          element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>}
        />
        <Route
          path="/admin/users"
          element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>}
        />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
