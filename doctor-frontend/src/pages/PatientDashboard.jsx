import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PatientDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  
  // Use dynamically stored user name or fallback to default
  const storedName = localStorage.getItem('userName') || 'John Doe';

  const [patientInfo] = useState({
    name: storedName,
    age: 35,
    bloodType: 'O+',
    lastCheckup: '2024-02-15'
  });

  useEffect(() => {
    // TODO: Fetch upcoming appointments
  }, []);

  return (
    <div className="patient-portal">
      <div className="dashboard-container">
        <div className="portal-header">
          <h1>👤 Patient Portal</h1>
          <p className="patient-welcome">Welcome, {patientInfo.name}</p>
        </div>

        {/* Patient Info Card */}
        <div className="patient-info-card">
          <div className="info-section">
            <h3>Personal Health Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Age:</span>
                <span className="value">{patientInfo.age} years</span>
              </div>
              <div className="info-item">
                <span className="label">Blood Type:</span>
                <span className="value">{patientInfo.bloodType}</span>
              </div>
              <div className="info-item">
                <span className="label">Last Checkup:</span>
                <span className="value">{patientInfo.lastCheckup}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className="value">✓ Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/patient/book-appointment" className="action-button patient-action">
            📅 Book Appointment
          </Link>
          <Link to="/patient/voice-recorder" className="action-button patient-action">
            🎤 Record Symptoms
          </Link>
          <Link to="/patient/my-appointments" className="action-button patient-action">
            📋 My Appointments
          </Link>
        </div>

        {/* Health Summary */}
        <div className="health-summary">
          <h2>Your Health Dashboard</h2>
          <div className="summary-cards">
            <div className="summary-card patient-summary">
              <h3>Last Checkup</h3>
              <p>{patientInfo.lastCheckup ? 'Completed' : 'Pending'}</p>
            </div>
            <div className="summary-card patient-summary">
              <h3>Risk Level</h3>
              <p className="risk-low">🟢 Low</p>
            </div>
            <div className="summary-card patient-summary">
              <h3>Active Prescriptions</h3>
              <p>0</p>
            </div>
            <div className="summary-card patient-summary">
              <h3>Next Appointment</h3>
              <p>Not Scheduled</p>
            </div>
          </div>
        </div>

        {/* Patient-Only Features */}
        <div className="features-section">
          <h2>Patient Features</h2>
          <div className="features-grid">
            <Link to="/patient/book-appointment" className="feature-card patient-feature">
              <span className="feature-icon">📅</span>
              <h3>Book Appointments</h3>
              <p>Schedule appointments with specialists</p>
            </Link>
            <Link to="/patient/voice-recorder" className="feature-card patient-feature">
              <span className="feature-icon">🎤</span>
              <h3>Voice Symptoms</h3>
              <p>Record symptoms using voice</p>
            </Link>
            <Link to="/patient/my-appointments" className="feature-card patient-feature">
              <span className="feature-icon">📋</span>
              <h3>My Appointments</h3>
              <p>View your appointment history</p>
            </Link>
            <Link className="feature-card patient-feature">
              <span className="feature-icon">📊</span>
              <h3>Health Reports</h3>
              <p>View AI-generated health summaries</p>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="upcoming-appointments">
          <h2>Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 && (
            <p className="empty-state">No upcoming appointments. <Link to="/patient/book-appointment">Book one now</Link>!</p>
          )}
        </div>

        {/* Access Restriction Notice */}
        <div className="restriction-notice patient-notice">
          <h3>🔒 Patient Portal - Restricted Access</h3>
          <ul>
            <li>✓ You can book appointments with available doctors</li>
            <li>✓ You can record symptoms using voice</li>
            <li>✓ You can view your appointments and medical history</li>
            <li>✗ Doctors CANNOT access this portal</li>
            <li>✗ You CANNOT access other patients' information</li>
            <li>✗ Medical professionals can only view YOUR assigned data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
