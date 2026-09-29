const cron = require('node-cron');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// Runs every 5 minutes. Accepts the Socket.io instance so it can emit
// real-time events straight from the scheduled job.
const initCronJobs = (io) => {
  cron.schedule('*/5 * * * *', async () => {
    await sendExpiryWarnings(io);
    await autoExpireListings();
  });

  console.log('⏰ Cron jobs scheduled: expiry warnings + auto-expire (every 5 min)');
};

// Task 1 — warn donors 2 hours before a listing expires, at most once per 30 min
const sendExpiryWarnings = async (io) => {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const listings = await Listing.find({
      status: 'available',
      expiresAt: { $gte: now, $lte: twoHoursFromNow },
      $or: [{ lastWarningAt: null }, { lastWarningAt: { $lte: thirtyMinutesAgo } }]
    }).populate('donor', 'name');

    for (const listing of listings) {
      const notification = await Notification.create({
        recipient: listing.donor._id,
        type: 'listing_expiring',
        title: 'Listing expiring soon',
        message: `Your listing "${listing.title}" expires within 2 hours.`,
        data: { listingId: listing._id }
      });

      io.to(`user_${listing.donor._id}`).emit('notification', notification);

      listing.lastWarningAt = now;
      await listing.save();
    }

    if (listings.length > 0) {
      console.log(`⏰ Sent ${listings.length} expiry warning(s).`);
    }
  } catch (err) {
    console.error('Error sending expiry warnings:', err.message);
  }
};

// Task 2 — bulk expire listings whose time has already passed
const autoExpireListings = async () => {
  try {
    const result = await Listing.updateMany(
      { status: 'available', expiresAt: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Auto-expired ${result.modifiedCount} listing(s).`);
    }
  } catch (err) {
    console.error('Error auto-expiring listings:', err.message);
  }
};

module.exports = initCronJobs;
