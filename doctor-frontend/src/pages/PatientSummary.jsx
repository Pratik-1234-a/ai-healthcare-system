import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function PatientSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [symptoms, setSymptoms] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = () => {
    // Get appointment data
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const apt = appointments.find(a => a.id === parseInt(id));
    setAppointment(apt);

    // Prefer per-appointment voiceSummary, fall back to global patientSummary
    const patientSummary = apt?.voiceSummary || JSON.parse(localStorage.getItem('patientSummary'));
    if (patientSummary) {
      setSummary(patientSummary.summary);
      setSymptoms(patientSummary.symptoms || []);
      setRiskLevel(patientSummary.riskLevel || 'Medium');

      // Generate recommendations based on symptoms
      generateRecommendations(patientSummary.symptoms);
    }

    setLoading(false);
  };

  const generateRecommendations = (symp) => {
    const recs = [];
    
    if (symp && symp.length > 0) {
      symp.forEach(symptom => {
        if (symptom.toLowerCase().includes('head')) {
          recs.push('Consider neurology consultation');
          recs.push('Check blood pressure and hydration levels');
        }
        if (symptom.toLowerCase().includes('chest')) {
          recs.push('Cardiology consultation recommended');
          recs.push('ECG examination needed');
        }
        if (symptom.toLowerCase().includes('fever')) {
          recs.push('Blood test and infection screening');
          recs.push('Hydration management');
        }
        if (symptom.toLowerCase().includes('pain')) {
          recs.push('Pain management assessment');
          recs.push('Physical examination required');
        }
      });
      
      setRecommendations([...new Set(recs)]);
    }
  };

  const handleContactDoctor = () => {
    alert('Doctor contact request sent!');
  };

  if (loading) {
    return <div className="loading">Loading patient summary...</div>;
  }

  if (!appointment) {
    return (
      <div className="patient-summary-container">
        <div className="empty-state">
          <h2>No appointment found</h2>
          <button onClick={() => navigate('/doctor/appointments')}>
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-summary-container">
      <div className="summary-header">
        <button className="back-btn" onClick={() => navigate('/doctor/appointments')}>
          ← Back to Appointments
        </button>
        <h1>📋 Patient Summary</h1>
      </div>

      <div className="summary-cards">
        {/* Appointment Info Card */}
        <div className="info-card">
          <h2>👤 Appointment Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Patient Name:</span>
              <span className="value">{appointment.patientName}</span>
            </div>
            <div className="info-item">
              <span className="label">Appointment Date:</span>
              <span className="value">📅 {appointment.appointmentDate}</span>
            </div>
            <div className="info-item">
              <span className="label">Appointment Time:</span>
              <span className="value">⏰ {appointment.appointmentTime}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value status ${appointment.status.toLowerCase()}`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Level Card */}
        <div className="risk-card">
          <h2>⚠️ Risk Assessment</h2>
          <div className="risk-display">
            <div className={`risk-badge ${riskLevel.toLowerCase()}`}>
              {riskLevel}
            </div>
            <p className="risk-description">
              {riskLevel === 'High' && 'This patient requires urgent attention and priority consultation.'}
              {riskLevel === 'Medium' && 'This patient shows moderate symptoms requiring standard care.'}
              {riskLevel === 'Low' && 'This patient shows mild symptoms and can be scheduled routinely.'}
            </p>
          </div>
        </div>

        {/* Patient Summary Card */}
        {summary && (
          <div className="summary-card">
            <h2>🎤 Voice AI Summary</h2>
            <div className="summary-content">
              <p>{summary}</p>
            </div>
          </div>
        )}

        {/* Symptoms Card */}
        {symptoms.length > 0 && (
          <div className="symptoms-card">
            <h2>🔍 Identified Symptoms</h2>
            <div className="symptoms-grid">
              {symptoms.map((symptom, idx) => (
                <div key={idx} className="symptom-tag">
                  {symptom}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Card */}
        {recommendations.length > 0 && (
          <div className="recommendations-card">
            <h2>💡 Medical Recommendations</h2>
            <ul className="recommendations-list">
              {recommendations.map((rec, idx) => (
                <li key={idx}>
                  <span className="rec-icon">✓</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={handleContactDoctor}>
              📞 Contact Patient
            </button>
            <button className="action-btn secondary">
              📝 Add Notes
            </button>
            <button className="action-btn secondary">
              💊 Create Prescription
            </button>
          </div>
        </div>
      </div>

      {/* Consultation Tips */}
      <div className="consultation-tips">
        <h3>📌 Consultation Tips</h3>
        <ul>
          <li>Review the patient's voice summary before the consultation</li>
          <li>Pay special attention to high-risk indicators</li>
          <li>Use the digital whiteboard to explain conditions to the patient</li>
          <li>Prepare prescription based on symptoms and recommendations</li>
          <li>Send prescription through the system for automatic email delivery</li>
        </ul>
      </div>
    </div>
  );
}

export default PatientSummary;
