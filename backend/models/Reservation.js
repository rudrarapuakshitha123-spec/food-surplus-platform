const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    pickupTime: { type: Date, required: true },
    notes: { type: String },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String }
  },
  { timestamps: true }
);

reservationSchema.index({ recipient: 1 });
reservationSchema.index({ donor: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
