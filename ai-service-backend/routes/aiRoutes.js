const express = require('express');
const summaryController = require('../controllers/summaryController');

const router = express.Router();

router.post('/patient-summary', summaryController.generatePatientSummary);
router.post('/risk-analysis', summaryController.analyzeRisk);
router.post('/voice-analysis', summaryController.analyzeVoiceRecording);

module.exports = router;
