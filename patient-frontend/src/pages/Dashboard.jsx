import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    // TODO: Fetch upcoming appointments
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Patient Dashboard</h1>
      <div className="quick-actions">
        <Link to="/book-appointment" className="action-button">
          Book Appointment
        </Link>
        <Link to="/voice-recorder" className="action-button">
          Record Symptoms
        </Link>
        <Link to="/my-appointments" className="action-button">
          My Appointments
        </Link>
      </div>
      <div className="upcoming-appointments">
        <h2>Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 && (
          <p>No upcoming appointments</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
