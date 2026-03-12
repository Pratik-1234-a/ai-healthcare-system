import React, { useEffect, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch appointments from API
    setLoading(false);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Doctor Dashboard</h1>
      <div className="appointments-list">
        {appointments.map((apt) => (
          <AppointmentCard key={apt.id} appointment={apt} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
