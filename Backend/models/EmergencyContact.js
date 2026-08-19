const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  relation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
