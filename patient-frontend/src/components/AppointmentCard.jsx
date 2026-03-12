import React from 'react';
import { Link } from 'react-router-dom';

function AppointmentCard({ appointment }) {
  return (
    <div className="appointment-card">
      <h3>Dr. {appointment.doctorName}</h3>
      <p>Appointment: {appointment.appointmentTime}</p>
      <p>Status: {appointment.status}</p>
      <Link to={`/appointment/${appointment.id}`} className="view-details">
        View Details
      </Link>
    </div>
  );
}

export default AppointmentCard;
