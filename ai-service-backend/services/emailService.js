const nodemailer = require('nodemailer');

// ─── Create Transporter ──────────────────────────────────────────────────
// Tries Gmail first. If Gmail auth fails (e.g. no App Password), 
// falls back to Ethereal (free test email service with preview links).

let transporter = null;
let transporterReady = false;
let usingEthereal = false;

const initTransporter = async () => {
  // Try Gmail first
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      const gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify the connection
      await gmailTransporter.verify();
      transporter = gmailTransporter;
      transporterReady = true;
      usingEthereal = false;
      console.log('✅ Gmail SMTP connected successfully');
      return;
    } catch (err) {
      console.log('⚠️  Gmail SMTP failed:', err.message);
      console.log('   → For Gmail, you need a Google App Password.');
      console.log('   → Go to https://myaccount.google.com/apppasswords to create one.');
      console.log('   → Falling back to Ethereal test email service...');
    }
  }

  // Fallback: Use Ethereal (free test email service)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    transporterReady = true;
    usingEthereal = true;
    console.log('✅ Ethereal test email connected');
    console.log(`   Test inbox: https://ethereal.email/login`);
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
  } catch (err) {
    console.error('❌ Failed to create any email transporter:', err.message);
    transporterReady = false;
  }
};

// Initialize on module load
initTransporter();

// ─── Helper: Ensure transporter is ready ──────────────────────────────
const getTransporter = async () => {
  if (!transporterReady) {
    await initTransporter();
  }
  if (!transporter) {
    throw new Error('Email service is not configured. Please check your email credentials.');
  }
  return transporter;
};

// ─── Send Appointment Confirmation ────────────────────────────────────
const sendAppointmentConfirmation = async (patientEmail, appointmentDetails) => {
  const t = await getTransporter();

  const mailOptions = {
    from: usingEthereal ? '"AI Healthcare System" <noreply@healthcare.ai>' : process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Appointment Confirmation — AI Healthcare System',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:#1e293b;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">⚕️ AI Healthcare System</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">✅ Appointment Confirmed</h2>
          <p>Dear Patient,</p>
          <p>Your appointment has been confirmed:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;font-weight:bold;color:#64748b;">Doctor</td><td style="padding:8px;">${appointmentDetails.doctorName}</td></tr>
            <tr style="background:#f1f5f9;"><td style="padding:8px;font-weight:bold;color:#64748b;">Date & Time</td><td style="padding:8px;">${appointmentDetails.appointmentTime}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#64748b;">Location</td><td style="padding:8px;">${appointmentDetails.location || 'AI Healthcare Clinic'}</td></tr>
          </table>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px;">Best regards,<br>AI Healthcare System</p>
        </div>
      </div>
    `,
  };

  const info = await t.sendMail(mailOptions);
  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : null;
  return { info, previewUrl, usingEthereal };
};

// ─── Send Prescription (with Whiteboard Image) ───────────────────────
const sendPrescription = async (patientEmail, prescriptionData) => {
  const t = await getTransporter();

  // Handle whiteboard image as inline attachment
  const attachments = [];
  let whiteboardHtml = '';

  if (prescriptionData.whiteboardImage && prescriptionData.whiteboardImage.startsWith('data:image')) {
    const base64Data = prescriptionData.whiteboardImage.split(',')[1];
    attachments.push({
      filename: 'whiteboard-notes.png',
      content: base64Data,
      encoding: 'base64',
      cid: 'whiteboard-image'
    });
    whiteboardHtml = `
      <h3 style="color:#1e293b;margin-top:24px;">📋 Doctor's Whiteboard Notes</h3>
      <div style="text-align:center;margin:12px 0;">
        <img src="cid:whiteboard-image" alt="Doctor's Whiteboard Notes" style="max-width:100%;border:2px solid #e2e8f0;border-radius:8px;" />
      </div>
    `;
  }

  // Format prescription text
  const prescriptionHtml = prescriptionData.prescriptionDetails
    ? prescriptionData.prescriptionDetails.split('\n').map(line => {
        if (line.trim() === '') return '<br>';
        if (/^\d+\./.test(line.trim())) {
          return `<p style="margin:4px 0;padding-left:8px;">💊 ${line.trim()}</p>`;
        }
        if (line.trim().toLowerCase().startsWith('precaution')) {
          return `<h4 style="color:#f59e0b;margin:12px 0 4px;">⚠️ ${line.trim()}</h4>`;
        }
        if (line.trim().toLowerCase().startsWith('follow')) {
          return `<h4 style="color:#06b6d4;margin:12px 0 4px;">📅 ${line.trim()}</h4>`;
        }
        return `<p style="margin:4px 0;">${line}</p>`;
      }).join('')
    : '<p>No specific prescription details provided.</p>';

  const mailOptions = {
    from: usingEthereal ? '"AI Healthcare System" <noreply@healthcare.ai>' : process.env.EMAIL_USER,
    to: patientEmail,
    subject: `Prescription from Dr. ${prescriptionData.doctorName} — AI Healthcare System`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">⚕️ AI Healthcare System</h1>
          <p style="color:#94a3b8;margin:4px 0 0;">Digital Prescription</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">
          <table style="width:100%;margin-bottom:20px;">
            <tr>
              <td><p style="margin:4px 0;"><strong>Doctor:</strong> Dr. ${prescriptionData.doctorName}</p></td>
              <td style="text-align:right;"><p style="margin:4px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p></td>
            </tr>
          </table>
          
          <hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0;">
          
          <h3 style="color:#1e293b;">💊 Prescription</h3>
          <div style="background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #06b6d4;">
            ${prescriptionHtml}
          </div>

          ${whiteboardHtml}
          
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;">
          <p style="color:#94a3b8;font-size:12px;">
            This is a digitally generated prescription from AI Healthcare System.<br>
            Please consult your doctor if you have any questions.
          </p>
        </div>
      </div>
    `,
    attachments
  };

  const info = await t.sendMail(mailOptions);
  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : null;
  return { info, previewUrl, usingEthereal };
};

// ─── Send Appointment Reminder ──────────────────────────────────────
const sendAppointmentReminder = async (patientEmail, appointmentDetails) => {
  const t = await getTransporter();

  const mailOptions = {
    from: usingEthereal ? '"AI Healthcare System" <noreply@healthcare.ai>' : process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Appointment Reminder — AI Healthcare System',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
        <div style="background:#1e293b;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;">⚕️ AI Healthcare System</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;">⏰ Appointment Reminder</h2>
          <p>Dear Patient,</p>
          <p>Reminder for your upcoming appointment:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;font-weight:bold;color:#64748b;">Doctor</td><td style="padding:8px;">${appointmentDetails.doctorName}</td></tr>
            <tr style="background:#f1f5f9;"><td style="padding:8px;font-weight:bold;color:#64748b;">Date & Time</td><td style="padding:8px;">${appointmentDetails.appointmentTime}</td></tr>
          </table>
          <p>Please arrive 10 minutes early.</p>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px;">Best regards,<br>AI Healthcare System</p>
        </div>
      </div>
    `,
  };

  const info = await t.sendMail(mailOptions);
  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : null;
  return { info, previewUrl, usingEthereal };
};

module.exports = {
  sendAppointmentConfirmation,
  sendPrescription,
  sendAppointmentReminder,
};
