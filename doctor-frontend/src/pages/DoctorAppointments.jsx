import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    // Load all appointments from localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Sort by risk level first, then by date
    const sorted = allAppointments.sort((a, b) => {
      const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      if (riskOrder[a.riskLevel || 'Medium'] !== riskOrder[b.riskLevel || 'Medium']) {
        return riskOrder[a.riskLevel || 'Medium'] - riskOrder[b.riskLevel || 'Medium'];
      }
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });
    
    setAppointments(sorted);
  };

  const updateAppointmentStatus = (appointmentId, newStatus) => {
    const updated = appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const viewPatientSummary = (appointmentId) => {
    navigate(`/doctor/patient-summary/${appointmentId}`);
  };

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(apt => apt.status.toLowerCase() === filterStatus.toLowerCase());

  const highRiskCount = appointments.filter(a => a.riskLevel === 'High' && a.status === 'Scheduled').length;
  const mediumRiskCount = appointments.filter(a => a.riskLevel === 'Medium' && a.status === 'Scheduled').length;

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>📅 Patient Appointments</h1>
        <p>Manage and track all patient appointments with risk prioritization</p>
      </div>

      {/* Risk Alert */}
      {highRiskCount > 0 && (
        <div className="risk-alert">
          <h3>⚠️ High Priority Cases: {highRiskCount}</h3>
          <p>You have {highRiskCount} high-risk patient(s) requiring urgent attention</p>
        </div>
      )}

      <div className="appointment-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{appointments.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Scheduled:</span>
          <span className="stat-value">{appointments.filter(a => a.status === 'Scheduled').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🔴 High Risk:</span>
          <span className="stat-value" style={{ color: '#e74c3c' }}>{highRiskCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">🟡 Medium Risk:</span>
          <span className="stat-value" style={{ color: '#f39c12' }}>{mediumRiskCount}</span>
        </div>
      </div>

      <div className="appointments-filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({appointments.length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'scheduled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('scheduled')}
        >
          Scheduled ({appointments.filter(a => a.status === 'Scheduled').length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed ({appointments.filter(a => a.status === 'Completed').length})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled ({appointments.filter(a => a.status === 'Cancelled').length})
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>No {filterStatus === 'all' ? '' : filterStatus} appointments</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className={`appointment-card-doctor ${apt.riskLevel?.toLowerCase() || 'medium'}-risk`}>
              <div className="appointment-header-card">
                <h3>{apt.patientName || 'Patient'}</h3>
                <div className="badge-group">
                  <span className={`status-badge ${apt.status.toLowerCase()}`}>
                    {apt.status}
                  </span>
                  {apt.riskLevel && (
                    <span className={`risk-badge ${apt.riskLevel.toLowerCase()}`}>
                      {apt.riskLevel === 'High' ? '🔴' : apt.riskLevel === 'Medium' ? '🟡' : '🟢'} {apt.riskLevel}
                    </span>
                  )}
                </div>
              </div>
              <div className="appointment-details">
                <p><strong>📅 Date:</strong> {apt.appointmentDate}</p>
                <p><strong>⏰ Time:</strong> {apt.appointmentTime}</p>
                <p><strong>👨‍⚕️ Doctor:</strong> Dr. {apt.doctorName}</p>
                <p><strong>🔬 Specialization:</strong> {apt.doctorSpecialization}</p>
              </div>
              <div className="appointment-actions">
                <button 
                  className="action-btn info"
                  onClick={() => viewPatientSummary(apt.id)}
                >
                  📋 View Summary
                </button>
                {apt.status === 'Scheduled' && (
                  <>
                    <button 
                      className="action-btn complete"
                      onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                    >
                      ✓ Complete
                    </button>
                    <button 
                      className="action-btn cancel"
                      onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                    >
                      ✕ Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
