import React, { useEffect, useState } from 'react';

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [specialization, allDoctors]);

  const loadDoctors = () => {
    // Load approved doctors from localStorage
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
    const approvedDoctors = approvedUsers.filter(user => user.type === 'doctor');
    
    // Add mock data for doctors with ratings and availability
    const doctorsWithDetails = approvedDoctors.map((doctor, index) => ({
      id: doctor.id,
      name: doctor.fullName,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      license: doctor.license,
      yearsOfExperience: Math.floor(Math.random() * 20) + 1,
      rating: (Math.random() * 2 + 3).toFixed(1),
      availableSlots: Math.floor(Math.random() * 8) + 2
    }));
    
    setAllDoctors(doctorsWithDetails);
    filterDoctorsBySpecialization(doctorsWithDetails, '');
  };

  const filterDoctors = () => {
    filterDoctorsBySpecialization(allDoctors, specialization);
  };

  const filterDoctorsBySpecialization = (doctorsList, specializationFilter) => {
    if (!specializationFilter) {
      setDoctors(doctorsList);
    } else {
      const filtered = doctorsList.filter(doc =>
        doc.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
      );
      setDoctors(filtered);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      alert('Please select a doctor, date, and time');
      return;
    }

    // Save appointment to localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const newAppointment = {
      id: Date.now(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      patientName: 'Current Patient', // Would be fetched from auth context
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      status: 'Scheduled',
      bookedAt: new Date().toLocaleDateString()
    };
    
    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSelectedDoctor(null);
      setAppointmentDate('');
      setAppointmentTime('');
      setSpecialization('');
    }, 2000);
  };

  if (booked) {
    return (
      <div className="book-appointment-container">
        <div className="success-message">
          <h2>✅ Appointment Booked Successfully!</h2>
          <p>Your appointment with Dr. {selectedDoctor.name} has been confirmed.</p>
          <p>Date: {appointmentDate} at {appointmentTime}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment-container">
      <h1>📅 Book Appointment</h1>
      <p className="subtitle">Select a doctor and schedule your appointment</p>
      
      <div className="booking-form">
        <div className="form-group">
          <label htmlFor="specialization">Select Specialization</label>
          <select
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="specialization-select"
          >
            <option value="">-- All Specializations --</option>
            <option value="General Practice">General Practice</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Surgery">Surgery</option>
          </select>
        </div>
      </div>

      <div className="doctors-list">
        <h2>Available Doctors {specialization && `(${specialization})`}</h2>
        {doctors.length === 0 ? (
          <div className="empty-state">
            <p>No doctors available for this specialization yet.</p>
            <p>Please select a different specialization or check back later.</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <div className="doctor-header">
                  <h3>Dr. {doctor.name}</h3>
                  <span className="rating">⭐ {doctor.rating}/5</span>
                </div>
                <div className="doctor-info">
                  <p><strong>Specialization:</strong> {doctor.specialization}</p>
                  <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>
                  <p><strong>Available Slots:</strong> {doctor.availableSlots}</p>
                  <p><strong>Contact:</strong> {doctor.phone}</p>
                </div>
                {selectedDoctor?.id === doctor.id && (
                  <div className="selected-badge">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div className="appointment-form">
          <h2>Schedule Appointment with Dr. {selectedDoctor.name}</h2>
          
          <div className="doctor-details">
            <div className="detail-item">
              <span className="label">Doctor:</span>
              <span className="value">Dr. {selectedDoctor.name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Specialization:</span>
              <span className="value">{selectedDoctor.specialization}</span>
            </div>
            <div className="detail-item">
              <span className="label">Experience:</span>
              <span className="value">{selectedDoctor.yearsOfExperience} years</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appointmentDate">Appointment Date</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="appointmentTime">Appointment Time</label>
              <input
                type="time"
                id="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="time-input"
              />
            </div>
          </div>

          <button onClick={handleBookAppointment} className="confirm-button">
            ✓ Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;
