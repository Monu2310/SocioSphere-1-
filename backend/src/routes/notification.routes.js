const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, broadcastNotification } = require('../controllers/notification.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/broadcast', authorizeAdmin, broadcastNotification);

module.exports = router;
