import React from 'react';
import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">
      <div className="doctor-card-photo">
        {doctor.image ? (
          <img src={doctor.image} alt={doctor.name} />
        ) : (
          <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
        )}
      </div>
      <div className="doctor-card-body">
        <h3>Dr. {doctor.name}</h3>
        <p className="doctor-specialization">{doctor.specialization}</p>
        <p className="doctor-meta">🎓 {doctor.qualification}</p>
        <p className="doctor-meta">🩺 {doctor.experience} yrs experience</p>
        <p className="doctor-meta">📅 {doctor.availableDays.join(', ')}</p>
        <p className="doctor-meta">🕒 {doctor.availableTime}</p>
        <p className="doctor-fee">₹{doctor.consultationFee} consultation</p>
        <Link to={`/doctors/${doctor._id}`} className="btn btn-primary btn-block">
          View Profile
        </Link>
      </div>
    </div>
  );
}
