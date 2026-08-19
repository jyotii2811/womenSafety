const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sosAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSAlert' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LocationLog', locationLogSchema);
