const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'resolved', 'cancelled'], default: 'active' },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
  },
  notifiedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }],
  resolvedAt: { type: Date },
  adminResponse: {
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    respondedAt: { type: Date },
    helpSent: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
