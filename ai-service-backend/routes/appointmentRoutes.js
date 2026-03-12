const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Appointment CRUD routes
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.patch('/:id/complete', appointmentController.completeAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
