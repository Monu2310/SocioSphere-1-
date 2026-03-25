const express = require('express');
const { getInsights, getActivityLogs } = require('../controllers/ai.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/insights', getInsights);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
