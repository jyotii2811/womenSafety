const router = require('express').Router();
const { logLocation, getLocationHistory } = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', logLocation);
router.get('/history', getLocationHistory);

module.exports = router;
