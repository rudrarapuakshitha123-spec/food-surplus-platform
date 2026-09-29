import { Link } from 'react-router-dom';
import './ListingCard.css';

const categoryIcons = {
  produce: '🥦', bakery: '🍞', dairy: '🧀', meat: '🍗',
  prepared: '🍱', canned: '🥫', beverages: '🧃', other: '📦'
};

const ListingCard = ({ listing }) => {
  const hoursLeft = Math.max(0, Math.round((new Date(listing.expiresAt) - new Date()) / 3600000));

  return (
    <Link to={`/listings/${listing._id}`} className="listing-card card">
      <div className="listing-card-header">
        <span className="listing-icon">{categoryIcons[listing.category] || '📦'}</span>
        <span className={`badge badge-${listing.status}`}>{listing.status}</span>
      </div>
      <h3 className="listing-title">{listing.title}</h3>
      <p className="listing-desc">{listing.description}</p>
      <div className="listing-meta">
        <span>{listing.quantity} {listing.unit}</span>
        <span>·</span>
        <span>{listing.areaCode}</span>
        {listing.isOrganic && <span className="organic-badge">🌱 Organic</span>}
      </div>
      <div className="listing-footer">
        <span>By {listing.donor?.name || 'Donor'}</span>
        <span className="listing-expiry">{hoursLeft > 0 ? `${hoursLeft}h left` : 'Expiring'}</span>
      </div>
    </Link>
  );
};

export default ListingCard;
