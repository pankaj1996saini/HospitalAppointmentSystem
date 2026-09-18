import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function DoctorDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data.data))
      .catch(() => setError('Could not find this doctor.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleBookClick() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
      return;
    }
    if (user.role !== 'patient') {
      return; // admins browsing shouldn't get a booking button anyway
    }
    navigate(`/book/${id}`);
  }

  if (loading) return <Loader text="Loading doctor profile..." />;
  if (error) return <div className="page-container"><Alert message={error} /></div>;
  if (!doctor) return null;

  return (
    <div className="page-container">
      <div className="doctor-details">
        <div className="doctor-details-photo">
          {doctor.image ? (
            <img src={doctor.image} alt={doctor.name} />
          ) : (
            <div className="doctor-avatar large">{doctor.name.charAt(0)}</div>
          )}
        </div>
        <div className="doctor-details-body">
          <h1>Dr. {doctor.name}</h1>
          <p className="doctor-specialization">{doctor.specialization}</p>

          <div className="doctor-details-grid">
            <div><strong>Qualification</strong><br />{doctor.qualification}</div>
            <div><strong>Experience</strong><br />{doctor.experience} years</div>
            <div><strong>Available Days</strong><br />{doctor.availableDays.join(', ')}</div>
            <div><strong>Available Time</strong><br />{doctor.availableTime}</div>
            <div><strong>Consultation Fee</strong><br />₹{doctor.consultationFee}</div>
          </div>

          {doctor.bio && (
            <div className="event-rules">
              <strong>About</strong>
              <p>{doctor.bio}</p>
            </div>
          )}

          {(!user || user.role === 'patient') && (
            <button className="btn btn-primary" onClick={handleBookClick}>
              Book Appointment
            </button>
          )}

          <p style={{ marginTop: '1rem' }}>
            <Link to="/doctors">← Back to doctors</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
