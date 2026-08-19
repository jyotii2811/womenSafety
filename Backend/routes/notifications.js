const router = require('express').Router();
const { getNotifications, markRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/mark-read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
