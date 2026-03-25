const express = require('express');
const { body } = require('express-validator');
const { getAllPolls, getPollById, createPoll, castVote, closePoll, deletePoll } = require('../controllers/poll.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', authenticate, getAllPolls);
router.get('/:id', authenticate, getPollById);

router.post('/', authenticate, authorizeAdmin, [
  body('title').trim().notEmpty().withMessage('Poll title is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options required'),
], validate, createPoll);

router.post('/:id/vote', authenticate, [
  body('optionId').notEmpty().withMessage('Option ID is required'),
], validate, castVote);

router.patch('/:id/close', authenticate, authorizeAdmin, closePoll);
router.delete('/:id', authenticate, authorizeAdmin, deletePoll);

module.exports = router;
