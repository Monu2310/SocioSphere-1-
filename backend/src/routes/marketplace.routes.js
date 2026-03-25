const express = require('express');
const { body } = require('express-validator');
const { getAllItems, getItemById, createItem, updateItem, deleteItem, getMarketplaceStats } = require('../controllers/marketplace.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/stats', authenticate, authorizeAdmin, getMarketplaceStats);
router.get('/', authenticate, getAllItems);
router.get('/:id', authenticate, getItemById);

router.post('/', authenticate, upload.array('images', 5), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
], validate, createItem);

router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);

module.exports = router;
