const router = require('express').Router();
const { logLocation, getLocationHistory, getNearbyServices } = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', logLocation);
router.get('/history', getLocationHistory);
router.get('/nearby', getNearbyServices);

module.exports = router;
