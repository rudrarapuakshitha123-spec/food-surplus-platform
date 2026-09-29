const express = require('express');
const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { sendReservationEmail } = require('../utils/emailService');

module.exports = (io) => {
  const router = express.Router();

  // POST /api/reservations  → recipient reserves a listing
  router.post('/', protect, authorize('recipient'), async (req, res) => {
    try {
      const { listingId, pickupTime, notes } = req.body;
      if (!listingId || !pickupTime) {
        return res.status(400).json({ message: 'listingId and pickupTime are required' });
      }

      const listing = await Listing.findById(listingId).populate('donor', 'name email notificationPreferences');
      if (!listing) return res.status(404).json({ message: 'Listing not found' });
      if (listing.status !== 'available') {
        return res.status(400).json({ message: 'This listing is no longer available' });
      }

      const reservation = await Reservation.create({
        listing: listing._id,
        recipient: req.user._id,
        donor: listing.donor._id,
        pickupTime,
        notes
      });

      listing.status = 'reserved';
      listing.reservedBy = req.user._id;
      listing.reservedAt = new Date();
      await listing.save();

      const notification = await Notification.create({
        recipient: listing.donor._id,
        type: 'reservation_update',
        title: 'New reservation',
        message: `${req.user.name} reserved your listing "${listing.title}".`,
        data: { reservationId: reservation._id, listingId: listing._id }
      });

      io.to(`user_${listing.donor._id}`).emit('notification', notification);

      if (listing.donor.notificationPreferences?.email) {
        sendReservationEmail(listing.donor.email, listing.title, req.user.name);
      }

      res.status(201).json({ reservation });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create reservation', error: err.message });
    }
  });

  // GET /api/reservations/my  → recipient's own reservations
  router.get('/my', protect, authorize('recipient'), async (req, res) => {
    try {
      const reservations = await Reservation.find({ recipient: req.user._id })
        .populate('listing')
        .populate('donor', 'name phone')
        .sort({ createdAt: -1 });
      res.json({ reservations });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
    }
  });

  // GET /api/reservations/incoming  → donor's incoming reservations
  router.get('/incoming', protect, authorize('donor', 'admin'), async (req, res) => {
    try {
      const reservations = await Reservation.find({ donor: req.user._id })
        .populate('listing')
        .populate('recipient', 'name phone')
        .sort({ createdAt: -1 });
      res.json({ reservations });
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch incoming reservations', error: err.message });
    }
  });

  // PUT /api/reservations/:id  → donor confirms/completes/cancels, or recipient cancels
  router.put('/:id', protect, async (req, res) => {
    try {
      const { status, cancelReason } = req.body;
      const validStatuses = ['confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const reservation = await Reservation.findById(req.params.id).populate('listing');
      if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

      const isDonor = reservation.donor.toString() === req.user._id.toString();
      const isRecipient = reservation.recipient.toString() === req.user._id.toString();
      if (!isDonor && !isRecipient && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this reservation' });
      }

      reservation.status = status;
      if (status === 'completed') reservation.completedAt = new Date();
      if (status === 'cancelled') {
        reservation.cancelledAt = new Date();
        reservation.cancelReason = cancelReason;
      }
      await reservation.save();

      // Keep the listing status in sync with the reservation outcome
      const listing = await Listing.findById(reservation.listing._id);
      if (status === 'completed') listing.status = 'completed';
      if (status === 'cancelled') {
        listing.status = 'available';
        listing.reservedBy = null;
        listing.reservedAt = null;
      }
      await listing.save();

      // Notify whichever party didn't make the change
      const notifyUserId = isDonor ? reservation.recipient : reservation.donor;
      const notification = await Notification.create({
        recipient: notifyUserId,
        type: 'reservation_update',
        title: 'Reservation update',
        message: `Reservation for "${listing.title}" is now ${status}.`,
        data: { reservationId: reservation._id, listingId: listing._id }
      });
      io.to(`user_${notifyUserId}`).emit('notification', notification);

      res.json({ reservation });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update reservation', error: err.message });
    }
  });

  return router;
};
