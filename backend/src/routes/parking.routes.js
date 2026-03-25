const express = require('express');
const { body } = require('express-validator');
const { getAllSlots, createSlot, createMultipleSlots, assignSlot, releaseSlot, deleteSlot, getParkingStats, addVehicle, removeVehicle } = require('../controllers/parking.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/stats', getParkingStats);
router.get('/', getAllSlots);

router.post('/', authorizeAdmin, [body('slotNumber').notEmpty()], validate, createSlot);
router.post('/bulk', authorizeAdmin, [
  body('prefix').notEmpty(),
  body('count').isInt({ min: 1, max: 200 }),
], validate, createMultipleSlots);

router.post('/:slotId/assign', authorizeAdmin, [body('userId').notEmpty()], validate, assignSlot);
router.patch('/:slotId/release', authorizeAdmin, releaseSlot);
router.delete('/:slotId', authorizeAdmin, deleteSlot);

// Vehicle routes
router.post('/vehicles', [body('licensePlate').notEmpty(), body('vehicleType').notEmpty()], validate, addVehicle);
router.delete('/vehicles/:vehicleId', removeVehicle);

module.exports = router;
