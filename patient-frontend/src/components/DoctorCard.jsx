import React from 'react';

function DoctorCard({ doctor, onSelect, isSelected }) {
  return (
    <div
      className={`doctor-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(doctor)}
    >
      <h3>{doctor.name}</h3>
      <p>Specialization: {doctor.specialization}</p>
      <p>Experience: {doctor.yearsOfExperience} years</p>
      <p>Rating: {doctor.rating} / 5</p>
    </div>
  );
}

export default DoctorCard;
