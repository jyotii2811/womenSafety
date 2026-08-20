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

exports.getNearbyServices = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Coordinates required' });

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Dynamic emergency service points relative to user coordinates
    const nearbyServices = [
      {
        id: 'police_1',
        name: 'Central Police Station & Control Room',
        type: 'police',
        phone: '100 / 112',
        lat: latitude + 0.005,
        lng: longitude + 0.003,
        distanceKm: 0.7,
      },
      {
        id: 'women_desk_1',
        name: 'Women Safety & Helpline Desk',
        type: 'women_desk',
        phone: '1091',
        lat: latitude - 0.003,
        lng: longitude + 0.004,
        distanceKm: 0.5,
      },
      {
        id: 'hospital_1',
        name: 'District Emergency Hospital & Trauma Center',
        type: 'hospital',
        phone: '102 / 108',
        lat: latitude + 0.008,
        lng: longitude - 0.006,
        distanceKm: 1.2,
      },
    ];

    res.json({ success: true, services: nearbyServices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
