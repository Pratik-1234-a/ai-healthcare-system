import React, { useEffect, useState } from 'react';

function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // TODO: Fetch appointments from API
  }, []);

  return (
    <div className="appointments-container">
      <h1>Appointments</h1>
      {/* TODO: Display appointments */}
    </div>
  );
}

export default Appointments;
