import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const blankForm = {
  name: '', specialization: '', experience: '', qualification: '',
  availableDays: [], availableTime: '', consultationFee: '', image: '', bio: '',
};

export default function AdminDoctorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/doctors/${id}`)
      .then((res) => {
        const d = res.data.data;
        setForm({
          name: d.name, specialization: d.specialization, experience: d.experience,
          qualification: d.qualification, availableDays: d.availableDays,
          availableTime: d.availableTime, consultationFee: d.consultationFee,
          image: d.image || '', bio: d.bio || '',
        });
      })
      .catch(() => setError('Could not load this doctor for editing.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleDay(day) {
    setForm((prev) => {
      const has = prev.availableDays.includes(day);
      return {
        ...prev,
        availableDays: has ? prev.availableDays.filter((d) => d !== day) : [...prev.availableDays, day],
      };
    });
  }

  function validate() {
    if (!form.name.trim()) return "Doctor's name is required.";
    if (!form.specialization.trim()) return 'Specialization is required.';
    if (form.experience === '' || Number(form.experience) < 0) return 'Enter a valid number of years.';
    if (!form.qualification.trim()) return 'Qualification is required.';
    if (form.availableDays.length === 0) return 'Select at least one available day.';
    if (!form.availableTime.trim()) return 'Available time is required.';
    if (form.consultationFee === '' || Number(form.consultationFee) < 0) return 'Enter a valid consultation fee.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, experience: Number(form.experience), consultationFee: Number(form.consultationFee) };
      if (isEdit) {
        await api.put(`/doctors/${id}`, payload);
      } else {
        await api.post('/doctors', payload);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Could not save doctor.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader text="Loading doctor..." />;

  return (
    <div className="page-container">
      <h1>{isEdit ? 'Edit Doctor' : 'Add New Doctor'}</h1>
      <Alert message={error} />
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Anita Rao" />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiologist" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Experience (years)</label>
            <input type="number" name="experience" min="0" value={form.experience} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Consultation Fee (₹)</label>
            <input type="number" name="consultationFee" min="0" value={form.consultationFee} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Qualification</label>
          <input type="text" name="qualification" value={form.qualification} onChange={handleChange} placeholder="e.g. MBBS, MD (Cardiology)" />
        </div>
        <div className="form-group">
          <label>Available Days</label>
          <div className="checkbox-row">
            {WEEKDAYS.map((day) => (
              <label key={day} className="checkbox-pill">
                <input type="checkbox" checked={form.availableDays.includes(day)} onChange={() => toggleDay(day)} />
                {day}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Available Time</label>
          <input type="text" name="availableTime" value={form.availableTime} onChange={handleChange} placeholder="e.g. 10:00 AM - 4:00 PM" />
        </div>
        <div className="form-group">
          <label>Photo URL (optional)</label>
          <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>Short Bio (optional)</label>
          <textarea name="bio" rows="3" value={form.bio} onChange={handleChange}></textarea>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Doctor' : 'Add Doctor'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
