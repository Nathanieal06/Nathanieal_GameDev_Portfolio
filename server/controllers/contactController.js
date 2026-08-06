const Contact = require('../models/Contact');
const { sendEmailNotification } = require('../services/emailService');
const { validationResult } = require('express-validator');

const submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { fullName, email, subject, message } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const newContact = await Contact.create({
      fullName,
      email,
      subject,
      message,
      ipAddress,
      userAgent,
    });

    // Send email asynchronously
    sendEmailNotification(newContact);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact };
