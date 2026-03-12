import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use dynamically stored user name or fallback to default
  const storedName = localStorage.getItem('userName') || 'Dr. John Smith';

  const [doctorInfo] = useState({
    name: storedName,
    specialization: 'General Physician',
    licenseNumber: 'LIC-2023-001',
    yearsOfExperience: 8,
    rating: 4.8
  });

  useEffect(() => {
    // Fetch appointments from API
    fetch('/api/appointments?doctor_id=123') // Replace with actual doctor_id
      .then((response) => response.json())
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="doctor-portal">
      <div className="dashboard-container">
        <div className="portal-header">
          <h1>👨‍⚕️ Doctor Portal</h1>
          <p className="doctor-welcome">Welcome, {doctorInfo.name}</p>
        </div>

        {/* Doctor Info Card */}
        <div className="doctor-info-card">
          <div className="info-section">
            <h3>Professional Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Specialization:</span>
                <span className="value">{doctorInfo.specialization}</span>
              </div>
              <div className="info-item">
                <span className="label">License Number:</span>
                <span className="value">{doctorInfo.licenseNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Experience:</span>
                <span className="value">{doctorInfo.yearsOfExperience} years</span>
              </div>
              <div className="info-item">
                <span className="label">Rating:</span>
                <span className="value">⭐ {doctorInfo.rating} / 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="dashboard-stats">
          <div className="stat-card doctor-stat">
            <h3>Today's Appointments</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card doctor-stat">
            <h3>Pending Reviews</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card doctor-stat">
            <h3>Total Patients</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card doctor-stat">
            <h3>Patient Summaries</h3>
            <p className="stat-number">0</p>
          </div>
        </div>

        {/* Doctor-Only Features */}
        <div className="features-section">
          <h2>Doctor Features</h2>
          <div className="features-grid">
            <Link to="/doctor/appointments" className="feature-card doctor-feature">
              <span className="feature-icon">📅</span>
              <h3>Manage Appointments</h3>
              <p>View and manage patient appointments</p>
            </Link>
            <Link className="feature-card doctor-feature">
              <span className="feature-icon">📊</span>
              <h3>Patient Summaries</h3>
              <p>AI-generated patient health summaries</p>
            </Link>
            <Link className="feature-card doctor-feature">
              <span className="feature-icon">💊</span>
              <h3>Prescriptions</h3>
              <p>Create and manage patient prescriptions</p>
            </Link>
            <Link className="feature-card doctor-feature">
              <span className="feature-icon">⚠️</span>
              <h3>Risk Assessment</h3>
              <p>AI-powered patient risk analysis</p>
            </Link>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="appointments-list">
          <h2>Upcoming Appointments</h2>
          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="empty-state">No appointments scheduled</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="appointment-item">
                <AppointmentCard appointment={apt} />
                {apt.voice_summary_url && (
                  <div className="voice-summary">
                    <h4>Voice Summary:</h4>
                    <audio controls>
                      <source src={apt.voice_summary_url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Access Restriction Notice */}
        <div className="restriction-notice doctor-notice">
          <h3>🔒 Doctor Portal - Restricted Access</h3>
          <ul>
            <li>✓ You can view and manage only YOUR appointments</li>
            <li>✓ You can access patient summaries assigned to you</li>
            <li>✓ You can create and edit prescriptions</li>
            <li>✗ Patients CANNOT access this portal</li>
            <li>✗ You CANNOT access patient personal data beyond assignments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
