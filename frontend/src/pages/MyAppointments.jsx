import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MyAppointments() {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.justBooked ? 'Appointment booked! Waiting on admin confirmation.' : '');

  function fetchAppointments() {
    setLoading(true);
    api.get('/appointments', { params: { sortBy: 'date', order: 'desc' } })
      .then((res) => setAppointments(res.data.data))
      .catch(() => setError('Could not load your appointments.'))
      .finally(() => setLoading(false));
  }

  useEffect(fetchAppointments, []);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setMessage('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel appointment.');
    }
  }

  if (loading) return <Loader text="Loading your appointments..." />;

  return (
    <div className="page-container">
      <h1>My Appointments</h1>
      <Alert type="success" message={message} />
      <Alert message={error} />

      {appointments.length === 0 ? (
        <p className="empty-state">
          You have no appointments yet. <Link to="/doctors">Find a doctor →</Link>
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>
                  <Link to={`/doctors/${a.doctor?._id}`}>Dr. {a.doctor?.name || 'Unknown'}</Link>
                </td>
                <td>{formatDate(a.date)}</td>
                <td>{a.time}</td>
                <td><span className={`badge badge-${a.status === 'confirmed' ? 'open' : a.status === 'completed' ? 'open' : 'closed'}`}>{a.status}</span></td>
                <td>
                  {['pending', 'confirmed'].includes(a.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a._id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
