import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Prescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: [
      { name: '', dosage: '', frequency: '', duration: '' }
    ],
    precautions: '',
    followUp: '',
    tests: '',
    additionalNotes: ''
  });
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadAppointmentData();
  }, [id]);

  const loadAppointmentData = () => {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const apt = appointments.find(a => a.id === parseInt(id));
    setAppointment(apt);

    const prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
    setSavedPrescriptions(prescriptions);
    setLoading(false);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const addMedicineRow = () => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: [...prescriptionData.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedicineRow = (index) => {
    const newMedicines = prescriptionData.medicines.filter((_, i) => i !== index);
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const handleSavePrescription = () => {
    if (prescriptionData.medicines.every(m => m.name && m.dosage && m.frequency && m.duration)) {
      const newPrescription = {
        id: Date.now(),
        appointmentId: parseInt(id),
        patientName: appointment?.patientName,
        patientEmail: appointment?.patientEmail || 'patient@example.com',
        doctorName: appointment?.doctorName,
        createdDate: new Date().toLocaleDateString(),
        createdTime: new Date().toLocaleTimeString(),
        ...prescriptionData,
        status: 'Created'
      };

      const prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
      prescriptions.push(newPrescription);
      localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
      setSavedPrescriptions(prescriptions);

      alert('✅ Prescription saved successfully!');
    } else {
      alert('❌ Please fill all medicine details');
    }
  };

  const handleSendViaEmail = async () => {
    if (!prescriptionData.medicines.some(m => m.name)) {
      alert('Please add at least one medicine');
      return;
    }

    setSending(true);
    try {
      // Mock Gmail API integration (prepare data for backend)
      const emailPayload = {
        to: appointment?.patientEmail || 'patient@example.com',
        subject: `Prescription from Dr. ${appointment?.doctorName}`,
        hospitalization: `
          <h2>Digital Prescription</h2>
          <p><strong>Patient:</strong> ${appointment?.patientName}</p>
          <p><strong>Doctor:</strong> Dr. ${appointment?.doctorName}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h3>Medicines Prescribed</h3>
          <table border="1" cellpadding="10">
            <tr>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
            ${prescriptionData.medicines.map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.dosage}</td>
                <td>${m.frequency}</td>
                <td>${m.duration}</td>
              </tr>
            `).join('')}
          </table>
          
          ${prescriptionData.precautions ? `<h3>Precautions</h3><p>${prescriptionData.precautions}</p>` : ''}
          ${prescriptionData.followUp ? `<h3>Follow-up</h3><p>${prescriptionData.followUp}</p>` : ''}
          ${prescriptionData.tests ? `<h3>Recommended Tests</h3><p>${prescriptionData.tests}</p>` : ''}
          ${prescriptionData.additionalNotes ? `<h3>Additional Notes</h3><p>${prescriptionData.additionalNotes}</p>` : ''}
        `
      };

      // In production, this would call a backend API that integrates with Gmail
      // For now, we'll save it and show mock success message
      console.log('Email would be sent with:', emailPayload);
      alert('✅ Prescription email sent to ' + (appointment?.patientEmail || 'patient@example.com'));
      
      // Update prescription status
      const prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
      const lastPrescription = prescriptions[prescriptions.length - 1];
      if (lastPrescription) {
        lastPrescription.status = 'Sent';
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        setSavedPrescriptions(prescriptions);
      }

    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = () => {
    // Mock PDF download
    const prescriptionText = `
PRESCRIPTION
============
Patient: ${appointment?.patientName}
Doctor: Dr. ${appointment?.doctorName}
Date: ${new Date().toLocaleDateString()}

MEDICINES:
${prescriptionData.medicines.map((m, i) => `${i+1}. ${m.name} - ${m.dosage} - ${m.frequency} - ${m.duration}`).join('\n')}

${prescriptionData.precautions ? `PRECAUTIONS: ${prescriptionData.precautions}` : ''}
${prescriptionData.followUp ? `FOLLOW-UP: ${prescriptionData.followUp}` : ''}
${prescriptionData.tests ? `TESTS: ${prescriptionData.tests}` : ''}
${prescriptionData.additionalNotes ? `NOTES: ${prescriptionData.additionalNotes}` : ''}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(prescriptionText));
    element.setAttribute('download', `prescription-${appointment?.patientName}-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return <div className="loading">Loading prescription details...</div>;
  }

  if (!appointment) {
    return (
      <div className="prescription-container">
        <div className="empty-state">
          <h2>No appointment found</h2>
          <button onClick={() => navigate('/doctor/appointments')}>Back to Appointments</button>
        </div>
      </div>
    );
  }

  return (
    <div className="prescription-container">
      <div className="prescription-header">
        <button className="back-btn" onClick={() => navigate('/doctor/appointments')}>
          ← Back
        </button>
        <h1>💊 Digital Prescription</h1>
        <p className="patient-info">Patient: {appointment.patientName}</p>
      </div>

      <div className="prescription-form">
        {/* Patient Info Card */}
        <div className="info-section">
          <h2>Patient Information</h2>
          <div className="info-grid">
            <div><span className="label">Name:</span> {appointment.patientName}</div>
            <div><span className="label">Email:</span> {appointment.patientEmail || 'patient@example.com'}</div>
            <div><span className="label">Doctor:</span> Dr. {appointment.doctorName}</div>
            <div><span className="label">Date:</span> {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Medicines Section */}
        <div className="medicines-section">
          <h2>Medicines</h2>
          <div className="medicines-table">
            <div className="table-header">
              <div className="col">Medicine Name</div>
              <div className="col">Dosage</div>
              <div className="col">Frequency</div>
              <div className="col">Duration</div>
              <div className="col">Action</div>
            </div>
            {prescriptionData.medicines.map((medicine, index) => (
              <div key={index} className="table-row">
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="e.g., 500mg"
                  value={medicine.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="e.g., Twice daily"
                  value={medicine.frequency}
                  onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="e.g., 7 days"
                  value={medicine.duration}
                  onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                  className="input-field"
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeMedicineRow(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add-medicine" onClick={addMedicineRow}>
            + Add Medicine
          </button>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="form-group">
            <label>Precautions & Warnings</label>
            <textarea
              value={prescriptionData.precautions}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, precautions: e.target.value })}
              placeholder="E.g., Avoid with alcohol, Take with food, etc."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Recommended Tests</label>
            <textarea
              value={prescriptionData.tests}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, tests: e.target.value })}
              placeholder="E.g., Blood test after 1 week, etc."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Follow-up Instructions</label>
            <textarea
              value={prescriptionData.followUp}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, followUp: e.target.value })}
              placeholder="E.g., Schedule follow-up visit after 2 weeks"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              value={prescriptionData.additionalNotes}
              onChange={(e) => setPrescriptionData({ ...prescriptionData, additionalNotes: e.target.value })}
              placeholder="Any other important information for the patient"
              rows="3"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="prescription-actions">
          <button className="btn-primary" onClick={handleSavePrescription}>
            💾 Save Prescription
          </button>
          <button className="btn-primary" onClick={handleSendViaEmail} disabled={sending}>
            {sending ? '📧 Sending...' : '📧 Send via Email'}
          </button>
          <button className="btn-secondary" onClick={handleDownloadPDF}>
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Saved Prescriptions List */}
      {savedPrescriptions.length > 0 && (
        <div className="saved-prescriptions">
          <h2>📋 Recent Prescriptions</h2>
          <div className="prescriptions-list">
            {savedPrescriptions.map((rx) => (
              <div key={rx.id} className="prescription-item">
                <div className="rx-header">
                  <h4>{rx.patientName}</h4>
                  <span className={`status-badge ${rx.status.toLowerCase()}`}>{rx.status}</span>
                </div>
                <p><strong>Date:</strong> {rx.createdDate} {rx.createdTime}</p>
                <p><strong>Medicines:</strong> {rx.medicines.filter(m => m.name).length} prescribed</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescription;
