import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container empty-state">
    <h2>404</h2>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
  </div>
);

export default NotFound;
