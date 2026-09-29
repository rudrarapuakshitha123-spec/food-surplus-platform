const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['donor', 'recipient', 'admin'], required: true, default: 'recipient' },
    areaCode: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      realtime: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

userSchema.index({ areaCode: 1 });

module.exports = mongoose.model('User', userSchema);
