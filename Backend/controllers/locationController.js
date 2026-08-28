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

// Haversine formula to compute distance in kilometers between two GPS coordinates
const getHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

exports.getNearbyServices = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'Coordinates required' });

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // List of regional police stations, women safety cells, and hospitals
    const rawServices = [
      {
        id: 'police_central',
        name: 'District Police Headquarters & Control Room',
        type: 'police',
        phone: '112',
        address: 'Sector Police HQ, Main Road',
        lat: latitude + 0.004,
        lng: longitude + 0.002,
      },
      {
        id: 'police_women_cell',
        name: 'Specialized Women Police Station',
        type: 'police',
        phone: '1091',
        address: 'Civic Center, Women Safety Division',
        lat: latitude - 0.003,
        lng: longitude + 0.004,
      },
      {
        id: 'police_outpost_north',
        name: 'North Zone Patrol Post & Police Outpost',
        type: 'police',
        phone: '100',
        address: 'North Junction Patrol Circle',
        lat: latitude + 0.008,
        lng: longitude - 0.005,
      },
      {
        id: 'hospital_trauma',
        name: 'District General Hospital & 24/7 Trauma Unit',
        type: 'hospital',
        phone: '102',
        address: 'Hospital Avenue, Emergency Block',
        lat: latitude + 0.006,
        lng: longitude - 0.004,
      },
      {
        id: 'shelter_women',
        name: 'Abhaya Women Protection Center & Safe House',
        type: 'women_desk',
        phone: '181',
        address: 'Safe Zone Colony, Sector 4',
        lat: latitude - 0.005,
        lng: longitude - 0.003,
      },
    ];

    // Compute distance and sort ascending (closest first)
    const sortedServices = rawServices
      .map((service) => ({
        ...service,
        distanceKm: getHaversineDistanceKm(latitude, longitude, service.lat, service.lng),
        mapLink: `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      nearestPoliceStation: sortedServices.find((s) => s.type === 'police'),
      services: sortedServices,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
