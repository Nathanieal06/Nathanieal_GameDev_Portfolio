const express = require('express');
const { check } = require('express-validator');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

router.post(
  '/',
  [
    check('fullName', 'Full name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('subject', 'Subject is required').not().isEmpty(),
    check('message', 'Message must be at least 20 characters').isLength({ min: 20 }),
  ],
  submitContact
);

module.exports = router;
