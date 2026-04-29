const express = require('express');
const {
	getInsights,
	getActivityLogs,
	getResidentAssistant,
	getComplaintTriage,
	getNoticeDraft,
	getFollowups,
	getMaintenanceForecast,
	getPriorityQueue,
} = require('../controllers/ai.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/assistant', getResidentAssistant);
router.post('/complaint-triage', getComplaintTriage);

router.get('/insights', authorizeAdmin, getInsights);
router.get('/activity-logs', authorizeAdmin, getActivityLogs);
router.post('/notice-draft', authorizeAdmin, getNoticeDraft);
router.get('/followups', authorizeAdmin, getFollowups);
router.get('/maintenance-forecast', authorizeAdmin, getMaintenanceForecast);
router.get('/priority-queue', authorizeAdmin, getPriorityQueue);

module.exports = router;
