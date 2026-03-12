const emailService = require('../services/emailService');

const sendAppointmentConfirmation = async (req, res) => {
  try {
    const { patientEmail, appointmentDetails } = req.body;

    const result = await emailService.sendAppointmentConfirmation(patientEmail, appointmentDetails);

    res.json({
      message: 'Appointment confirmation email sent',
      previewUrl: result.previewUrl || null,
      usingTestMode: result.usingEthereal || false
    });
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};

const sendPrescription = async (req, res) => {
  try {
    const { patientEmail, prescriptionData } = req.body;

    if (!patientEmail) {
      return res.status(400).json({ error: 'Patient email is required' });
    }

    const result = await emailService.sendPrescription(patientEmail, prescriptionData);

    res.json({
      message: result.usingEthereal
        ? 'Prescription email sent (test mode). Preview the email at the link below.'
        : `Prescription email sent successfully to ${patientEmail}`,
      previewUrl: result.previewUrl || null,
      usingTestMode: result.usingEthereal || false
    });
  } catch (error) {
    console.error('Error sending prescription:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};

const sendAppointmentReminder = async (req, res) => {
  try {
    const { patientEmail, appointmentDetails } = req.body;

    const result = await emailService.sendAppointmentReminder(patientEmail, appointmentDetails);

    res.json({
      message: 'Appointment reminder email sent',
      previewUrl: result.previewUrl || null,
      usingTestMode: result.usingEthereal || false
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendPrescription,
  sendAppointmentReminder,
};
