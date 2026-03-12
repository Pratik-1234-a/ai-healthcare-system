const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Prescription CRUD routes
router.post('/', prescriptionController.createPrescription);
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.put('/:id', prescriptionController.updatePrescription);
router.post('/:id/send', prescriptionController.sendPrescriptionEmail);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
