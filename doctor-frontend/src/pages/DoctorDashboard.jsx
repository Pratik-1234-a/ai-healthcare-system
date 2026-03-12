import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo] = useState({
    name: 'Dr. John Smith',
    specialization: 'General Physician',
    licenseNumber: 'LIC-2023-001',
    yearsOfExperience: 8,
    rating: 4.8
  });

  useEffect(() => {
    // TODO: Fetch appointments from API
    setLoading(false);
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
          {appointments.length === 0 ? (
            <p className="empty-state">No appointments scheduled</p>
          ) : (
            appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
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
