const express = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard  → admin-wide stats
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalListings, activeListings, completedListings, totalUsers, categoryBreakdown] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'available' }),
      Listing.countDocuments({ status: 'completed' }),
      User.countDocuments(),
      Listing.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
    ]);

    res.json({
      totalListings,
      activeListings,
      completedListings,
      totalUsers,
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
});

// GET /api/analytics/donor  → personal stats for logged-in donor
router.get('/donor', protect, authorize('donor'), async (req, res) => {
  try {
    const [total, active, completed, expired] = await Promise.all([
      Listing.countDocuments({ donor: req.user._id }),
      Listing.countDocuments({ donor: req.user._id, status: 'available' }),
      Listing.countDocuments({ donor: req.user._id, status: 'completed' }),
      Listing.countDocuments({ donor: req.user._id, status: 'expired' })
    ]);

    res.json({ total, active, completed, expired });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donor analytics', error: err.message });
  }
});

module.exports = router;
