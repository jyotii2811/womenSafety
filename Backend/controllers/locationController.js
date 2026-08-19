const LocationLog = require('../models/LocationLog');

exports.logLocation = async (req, res) => {
  try {
    const { lat, lng, address, sosAlert } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    const log = await LocationLog.create({ user: req.user._id, lat, lng, address, sosAlert });
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLocationHistory = async (req, res) => {
  try {
    const logs = await LocationLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
