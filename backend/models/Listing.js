const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['produce', 'bakery', 'dairy', 'meat', 'prepared', 'canned', 'beverages', 'other'],
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'items', 'boxes', 'bags', 'liters', 'servings', 'portions'],
      required: true
    },
    expiresAt: { type: Date, required: true },
    areaCode: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'expired', 'cancelled'],
      default: 'available'
    },
    images: [{ type: String }],
    allergens: [{ type: String }],
    isOrganic: { type: Boolean, default: false },
    pickupInstructions: { type: String },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reservedAt: { type: Date, default: null },
    lastWarningAt: { type: Date, default: null }
  },
  { timestamps: true }
);

listingSchema.index({ areaCode: 1, status: 1 });
listingSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Listing', listingSchema);
