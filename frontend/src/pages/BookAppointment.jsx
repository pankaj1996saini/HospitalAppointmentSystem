import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

// hard-coded 30 minute slots between a doctor's stated hours would be ideal,
// but since availableTime is a free-text field, we just offer a fixed set
// of common visiting slots and let the backend catch actual clashes.
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({ date: '', time: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then((res) => setDoctor(res.data.data))
      .catch(() => setLoadError('Could not load this doctor.'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.date) return 'Pick a date for the appointment.';
    if (!form.time) return 'Pick a time slot.';
    if (!form.reason.trim()) return 'Tell us briefly why you need this appointment.';

    const chosenDay = new Date(form.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (doctor && !doctor.availableDays.includes(chosenDay)) {
      return `Dr. ${doctor.name} doesn't see patients on ${chosenDay}s. Available: ${doctor.availableDays.join(', ')}`;
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', { doctor: doctorId, ...form });
      navigate('/my-appointments', { state: { justBooked: true } });
    } catch (err) {
      setFormError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Booking failed, please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader text="Loading..." />;
  if (loadError) return <div className="page-container"><Alert message={loadError} /></div>;

  return (
    <div className="page-container">
      <h1>Book an Appointment</h1>
      {doctor && (
        <p className="results-count">
          with <strong>Dr. {doctor.name}</strong> ({doctor.specialization}) — ₹{doctor.consultationFee} consultation fee
        </p>
      )}

      <Alert message={formError} />

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label>Time Slot</label>
            <select name="time" value={form.time} onChange={handleChange}>
              <option value="">Select a time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Reason for Visit</label>
          <textarea name="reason" rows="3" value={form.reason} onChange={handleChange} placeholder="Briefly describe your symptoms or reason for the visit"></textarea>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
          <Link to={`/doctors/${doctorId}`} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
