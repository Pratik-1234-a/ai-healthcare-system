import React, { useEffect, useState } from 'react';
import DoctorCard from '../components/DoctorCard';

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');

  useEffect(() => {
    // TODO: Fetch available doctors
  }, []);

  const handleBookAppointment = async () => {
    // TODO: Send booking request to API
    console.log('Booking appointment with:', selectedDoctor, appointmentDate);
  };

  return (
    <div className="book-appointment-container">
      <h1>Book Appointment</h1>
      <div className="doctors-list">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onSelect={setSelectedDoctor}
            isSelected={selectedDoctor?.id === doctor.id}
          />
        ))}
      </div>
      {selectedDoctor && (
        <div className="appointment-form">
          <input
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
          <button onClick={handleBookAppointment}>Confirm Booking</button>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;
