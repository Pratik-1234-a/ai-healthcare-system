import React from 'react';
import { Link } from 'react-router-dom';

function AppointmentCard({ appointment }) {
  return (
    <div className="appointment-card">
      <h3>{appointment.patientName}</h3>
      <p>Time: {appointment.appointmentTime}</p>
      <p>Status: {appointment.status}</p>
      <Link to={`/patient-summary/${appointment.patientId}`}>
        View Summary
      </Link>
    </div>
  );
}

export default AppointmentCard;
