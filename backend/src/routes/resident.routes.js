const express = require('express');
const { body } = require('express-validator');
const { getAllResidents, getResidentById, createResident, updateResident, deleteResident, getDashboardStats } = require('../controllers/resident.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard-stats', authorizeAdmin, getDashboardStats);
router.get('/', authorizeAdmin, getAllResidents);
router.get('/:id', authorizeAdmin, getResidentById);

router.post('/', authorizeAdmin, [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('flatNumber').trim().notEmpty(),
], validate, createResident);

router.put('/:id', authorizeAdmin, updateResident);
router.delete('/:id', authorizeAdmin, deleteResident);

module.exports = router;
