const router = require('express').Router();
const { triggerSOS, getMyAlerts, resolveAlert, cancelAlert, uploadMedia } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/trigger', triggerSOS);
router.post('/upload-media', uploadMedia);
router.get('/my', getMyAlerts);
router.put('/:id/resolve', resolveAlert);
router.put('/:id/cancel', cancelAlert);

module.exports = router;
