const router = require('express').Router();
const { triggerSOS, getMyAlerts, resolveAlert, cancelAlert } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/trigger', triggerSOS);
router.get('/my', getMyAlerts);
router.put('/:id/resolve', resolveAlert);
router.put('/:id/cancel', cancelAlert);

module.exports = router;
