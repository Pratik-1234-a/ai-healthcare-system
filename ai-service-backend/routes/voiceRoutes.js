const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

// Voice recording CRUD routes
router.post('/', voiceController.createVoiceRecording);
router.get('/', voiceController.getAllVoiceRecordings);
router.get('/:id', voiceController.getVoiceRecordingById);
router.get('/patient/:patient_id/latest', voiceController.getLatestVoiceRecording);
router.put('/:id', voiceController.updateVoiceRecording);
router.delete('/:id', voiceController.deleteVoiceRecording);

module.exports = router;
