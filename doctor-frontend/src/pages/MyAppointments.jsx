import React, { useEffect, useState } from 'react';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    // Load appointments from localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    setAppointments(allAppointments);
  };

  const cancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const updated = appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
      );
      setAppointments(updated);
      localStorage.setItem('appointments', JSON.stringify(updated));
      alert('Appointment cancelled successfully');
    }
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="my-appointments-container">
      <div className="appointments-header">
        <h1>📋 My Appointments</h1>
        <p>Track and manage your scheduled appointments</p>
      </div>

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
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{appointments.filter(a => a.status === 'Completed').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cancelled:</span>
          <span className="stat-value">{appointments.filter(a => a.status === 'Cancelled').length}</span>
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

      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="no-appointments">
            <p>No {filterStatus === 'all' ? '' : filterStatus} appointments</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div key={apt.id} className="appointment-item">
              <div className="appointment-info">
                <h3>Dr. {apt.doctorName}</h3>
                <p className="specialization">🔬 {apt.doctorSpecialization}</p>
                <p className="time">📅 {apt.appointmentDate} at {apt.appointmentTime}</p>
              </div>
              <div className="appointment-status">
                <span className={`status-badge ${apt.status.toLowerCase()}`}>
                  {apt.status}
                </span>
              </div>
              <div className="appointment-actions">
                {apt.status === 'Scheduled' && (
                  <>
                    <button className="action-btn reschedule">📆 Reschedule</button>
                    <button 
                      className="action-btn cancel"
                      onClick={() => cancelAppointment(apt.id)}
                    >
                      ✕ Cancel
                    </button>
                  </>
                )}
                {apt.status === 'Completed' && (
                  <>
                    <button className="action-btn view">👁️ View Summary</button>
                    <button className="action-btn rate">⭐ Rate Doctor</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyAppointments;
