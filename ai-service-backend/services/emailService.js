const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendAppointmentConfirmation = async (patientEmail, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Appointment Confirmation',
    html: `
      <h1>Appointment Confirmation</h1>
      <p>Dear Patient,</p>
      <p>Your appointment has been confirmed.</p>
      <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
      <p><strong>Date & Time:</strong> ${appointmentDetails.appointmentTime}</p>
      <p><strong>Location:</strong> ${appointmentDetails.location}</p>
      <p>Best regards,<br>AI Healthcare System</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendPrescription = async (patientEmail, prescriptionData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Your Prescription',
    html: `
      <h1>Prescription from Dr. ${prescriptionData.doctorName}</h1>
      <p>Dear Patient,</p>
      <p>Your prescription is ready:</p>
      <pre>${prescriptionData.prescriptionDetails}</pre>
      <p>Best regards,<br>AI Healthcare System</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendAppointmentReminder = async (patientEmail, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Appointment Reminder',
    html: `
      <h1>Appointment Reminder</h1>
      <p>Dear Patient,</p>
      <p>This is a reminder for your upcoming appointment.</p>
      <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
      <p><strong>Date & Time:</strong> ${appointmentDetails.appointmentTime}</p>
      <p>Please arrive 10 minutes early.</p>
      <p>Best regards,<br>AI Healthcare System</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendAppointmentConfirmation,
  sendPrescription,
  sendAppointmentReminder,
};
