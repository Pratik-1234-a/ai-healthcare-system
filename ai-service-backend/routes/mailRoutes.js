const express = require('express');
const mailController = require('../controllers/mailController');

const router = express.Router();

router.post('/send-appointment-confirmation', mailController.sendAppointmentConfirmation);
router.post('/send-prescription', mailController.sendPrescription);
router.post('/send-appointment-reminder', mailController.sendAppointmentReminder);

module.exports = router;
