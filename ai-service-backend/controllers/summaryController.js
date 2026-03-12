const openaiService = require('../services/openaiService');
const riskAnalyzer = require('../services/riskAnalyzer');

const generatePatientSummary = async (req, res) => {
  try {
    const { patientHistory, symptoms, medicalRecords } = req.body;

    const summary = await openaiService.generateSummary({
      patientHistory,
      symptoms,
      medicalRecords,
    });

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

const analyzeRisk = async (req, res) => {
  try {
    const { patientData } = req.body;

    const riskAnalysis = await riskAnalyzer.analyzePatientRisk(patientData);

    res.json({ riskAnalysis });
  } catch (error) {
    console.error('Error analyzing risk:', error);
    res.status(500).json({ error: 'Failed to analyze risk' });
  }
};

const analyzeVoiceRecording = async (req, res) => {
  try {
    // TODO: Implement voice analysis
    res.json({ message: 'Voice analysis not yet implemented' });
  } catch (error) {
    console.error('Error analyzing voice:', error);
    res.status(500).json({ error: 'Failed to analyze voice' });
  }
};

module.exports = {
  generatePatientSummary,
  analyzeRisk,
  analyzeVoiceRecording,
};
