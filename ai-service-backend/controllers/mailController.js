const emailService = require('../services/emailService');

const sendAppointmentConfirmation = async (req, res) => {
  try {
    const { patientEmail, appointmentDetails } = req.body;

    await emailService.sendAppointmentConfirmation(patientEmail, appointmentDetails);

    res.json({ message: 'Appointment confirmation email sent' });
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

const sendPrescription = async (req, res) => {
  try {
    const { patientEmail, prescriptionData } = req.body;

    await emailService.sendPrescription(patientEmail, prescriptionData);

    res.json({ message: 'Prescription email sent' });
  } catch (error) {
    console.error('Error sending prescription:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

const sendAppointmentReminder = async (req, res) => {
  try {
    const { patientEmail, appointmentDetails } = req.body;

    await emailService.sendAppointmentReminder(patientEmail, appointmentDetails);

    res.json({ message: 'Appointment reminder email sent' });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendPrescription,
  sendAppointmentReminder,
};
