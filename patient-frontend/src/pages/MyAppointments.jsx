import React, { useEffect, useState } from 'react';
import AppointmentCard from '../components/AppointmentCard';

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // TODO: Fetch patient's appointments
  }, []);

  return (
    <div className="my-appointments-container">
      <h1>My Appointments</h1>
      <div className="appointments-list">
        {appointments.map((apt) => (
          <AppointmentCard key={apt.id} appointment={apt} />
        ))}
      </div>
    </div>
  );
}

export default MyAppointments;
