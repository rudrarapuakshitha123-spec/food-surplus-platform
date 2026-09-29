const express = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { sendNewListingEmail } = require('../utils/emailService');

// Exported as a factory so server.js can inject the shared Socket.io instance
module.exports = (io) => {
  const router = express.Router();

  // GET /api/listings  → browse, filterable by areaCode/category/status + pagination
  router.get('/', protect, async (req, res) => {
    try {
      const { areaCode, category, status, page = 1, limit = 12 } = req.query;

      const filter = {};
      if (areaCode) filter.areaCode = areaCode;
      if (category) filter.category = category;
      filter.status = status || 'available';

      const skip = (Number(page) - 1) * Number(limit);

      const [listings, total] = await Promise.all([
        Listing.find(filter)
          .populate('donor', 'name areaCode phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Listing.countDocuments(filter)
      ]);

      res.json({
        listings,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch listings', error: err.message });
    }
  });

  // GET /api/listings/my/all  → donor's own listings (all statuses)
  router.get('/my/all', protect, authorize('donor', 'admin'), async (req, res) => {
    try {
      const listings = await Listing.find({ donor: req.user._id }).sort({ createdAt: -1 });
      res.json({ listings });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch your listings', error: err.message });
    }
  });

  // GET /api/listings/:id
  router.get('/:id', protect, async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate('donor', 'name areaCode phone email')
        .populate('reservedBy', 'name');

      if (!listing) return res.status(404).json({ message: 'Listing not found' });
      res.json({ listing });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch listing', error: err.message });
    }
  });

  // POST /api/listings  → create (donor/admin only) → Socket + Email broadcast
  router.post('/', protect, authorize('donor', 'admin'), async (req, res) => {
    try {
      const {
        title, description, category, quantity, unit,
        expiresAt, areaCode, address, allergens, isOrganic, pickupInstructions
      } = req.body;

      if (!title || !description || !category || !quantity || !unit || !expiresAt || !areaCode || !address) {
        return res.status(400).json({ message: 'Missing required listing fields' });
      }
      if (new Date(expiresAt) <= new Date()) {
        return res.status(400).json({ message: 'Expiry time must be in the future' });
      }

      const listing = await Listing.create({
        donor: req.user._id,
        title,
        description,
        category,
        quantity,
        unit,
        expiresAt,
        areaCode,
        address,
        allergens: allergens || [],
        isOrganic: !!isOrganic,
        pickupInstructions
      });

      const populated = await listing.populate('donor', 'name areaCode');

      // Real-time broadcast to everyone browsing that area
      io.to(`area_${areaCode}`).emit('new_listing', populated);

      // Create in-app notifications + emails for matching recipients
      const recipients = await User.find({
        role: 'recipient',
        areaCode,
        isActive: true
      });

      const notifDocs = recipients.map((r) => ({
        recipient: r._id,
        type: 'new_listing',
        title: 'New food available near you',
        message: `${title} was just posted in your area.`,
        data: { listingId: listing._id }
      }));

      if (notifDocs.length > 0) {
        await Notification.insertMany(notifDocs);
      }

      recipients.forEach((r) => {
        if (r.notificationPreferences?.email) {
          sendNewListingEmail(r.email, listing);
        }
      });

      res.status(201).json({ listing: populated });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create listing', error: err.message });
    }
  });

  // PUT /api/listings/:id  → owner or admin only
  router.put('/:id', protect, async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ message: 'Listing not found' });

      const isOwner = listing.donor.toString() === req.user._id.toString();
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this listing' });
      }

      const editableFields = [
        'title', 'description', 'category', 'quantity', 'unit',
        'expiresAt', 'address', 'allergens', 'isOrganic', 'pickupInstructions', 'status'
      ];
      editableFields.forEach((field) => {
        if (req.body[field] !== undefined) listing[field] = req.body[field];
      });

      await listing.save();
      res.json({ listing });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update listing', error: err.message });
    }
  });

  // DELETE /api/listings/:id  → owner or admin only
  router.delete('/:id', protect, async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return res.status(404).json({ message: 'Listing not found' });

      const isOwner = listing.donor.toString() === req.user._id.toString();
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this listing' });
      }

      await listing.deleteOne();
      res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete listing', error: err.message });
    }
  });

  return router;
};
