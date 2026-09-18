import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DoctorCard from '../components/DoctorCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/appointments'),
      api.get('/doctors', { params: { limit: 4 } }),
    ])
      .then(([apRes, docRes]) => {
        setAppointments(apRes.data.data);
        setDoctors(docRes.data.data);
      })
      .catch(() => setError('Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading your dashboard..." />;

  const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status));
  const completed = appointments.filter((a) => a.status === 'completed');
  const cancelled = appointments.filter((a) => ['cancelled', 'rejected'].includes(a.status));

  return (
    <div className="page-container">
      <h1>Welcome back, {user.name.split(' ')[0]}</h1>
      <Alert message={error} />

      <div className="stats-row">
        <div className="stat-card"><h3>{upcoming.length}</h3><p>Upcoming</p></div>
        <div className="stat-card"><h3>{completed.length}</h3><p>Completed</p></div>
        <div className="stat-card"><h3>{cancelled.length}</h3><p>Cancelled</p></div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Upcoming Appointments</h2>
          <Link to="/my-appointments">View all →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="empty-state">Nothing booked yet. <Link to="/doctors">Find a doctor →</Link></p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {upcoming.slice(0, 5).map((a) => (
                <tr key={a._id}>
                  <td>Dr. {a.doctor?.name}</td>
                  <td>{formatDate(a.date)}</td>
                  <td>{a.time}</td>
                  <td><span className={`badge badge-${a.status === 'confirmed' ? 'open' : 'full'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Available Doctors</h2>
          <Link to="/doctors">Browse all →</Link>
        </div>
        {doctors.length === 0 ? (
          <p className="empty-state">No doctors listed yet.</p>
        ) : (
          <div className="doctor-grid">
            {doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}
          </div>
        )}
      </section>
    </div>
  );
}
