const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const ActivityLog = require('../models/ActivityLog');
const LocationLog = require('../models/LocationLog');
const Notification = require('../models/Notification');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalAlerts, activeAlerts, totalLogs] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      SOSAlert.countDocuments(),
      SOSAlert.countDocuments({ status: 'active' }),
      ActivityLog.countDocuments(),
    ]);
    res.json({ success: true, stats: { totalUsers, totalAlerts, activeAlerts, totalLogs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const users = await User.find(query).select('-password').skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAlerts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const alerts = await SOSAlert.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await SOSAlert.countDocuments(query);
    res.json({ success: true, alerts, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { search = '', action = '' } = req.query;
    const query = {};
    if (action) query.action = action;

    let logs = await ActivityLog.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(200);

    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.user?.name?.toLowerCase().includes(searchLower) ||
          l.user?.email?.toLowerCase().includes(searchLower) ||
          l.action?.toLowerCase().includes(searchLower) ||
          l.details?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLocationLogs = async (req, res) => {
  try {
    const locationLogs = await LocationLog.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, locationLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToAlert = async (req, res) => {
  try {
    const { message, helpSent } = req.body;
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      {
        status: helpSent ? 'resolved' : 'active',
        resolvedAt: helpSent ? new Date() : undefined,
        adminResponse: {
          respondedBy: req.user._id,
          message,
          respondedAt: new Date(),
          helpSent: !!helpSent,
        },
      },
      { new: true }
    ).populate('user', 'name email phone');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    // Notify user
    await Notification.create({
      user: alert.user._id,
      message: helpSent
        ? `✅ Admin has sent help for your SOS alert!`
        : `📩 Admin message: ${message}`,
      type: 'sos',
    });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
