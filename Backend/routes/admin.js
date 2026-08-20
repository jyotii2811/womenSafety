const router = require('express').Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllAlerts,
  getActivityLogs,
  getLocationLogs,
  respondToAlert,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/alerts', getAllAlerts);
router.put('/alerts/:id/respond', respondToAlert);
router.get('/logs', getActivityLogs);
router.get('/location-logs', getLocationLogs);

module.exports = router;
