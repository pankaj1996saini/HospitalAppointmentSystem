import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  function loadEverything() {
    setLoading(true);
    Promise.all([
      api.get('/doctors', { params: { status: 'all', limit: 100 } }),
      api.get('/patients', { params: { search: patientSearch } }),
      api.get('/appointments'),
    ])
      .then(([docRes, patRes, apRes]) => {
        setDoctors(docRes.data.data);
        setPatients(patRes.data.data);
        setAppointments(apRes.data.data);
      })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }

  useEffect(loadEverything, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/patients', { params: { search: patientSearch } }).then((res) => setPatients(res.data.data));
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  async function toggleDoctorActive(doc) {
    try {
      await api.put(`/doctors/${doc._id}`, { isActive: !doc.isActive });
      loadEverything();
    } catch (err) {
      setError('Could not update doctor.');
    }
  }

  async function deleteDoctor(id) {
    if (!window.confirm('Remove this doctor? Their appointments will be removed too.')) return;
    try {
      await api.delete(`/doctors/${id}`);
      setMessage('Doctor removed.');
      loadEverything();
    } catch (err) {
      setError('Could not remove doctor.');
    }
  }

  async function togglePatientStatus(p) {
    try {
      await api.put(`/patients/${p._id}/status`, { status: p.status === 'active' ? 'blocked' : 'active' });
      loadEverything();
    } catch (err) {
      setError('Could not update patient status.');
    }
  }

  async function changeAppointmentStatus(id, status) {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      loadEverything();
    } catch (err) {
      setError('Could not update appointment status.');
    }
  }

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>Admin Dashboard</h1>
        <Link to="/admin/doctors/new" className="btn btn-primary">+ Add Doctor</Link>
      </div>

      <Alert type="success" message={message} />
      <Alert message={error} />

      <div className="stats-row">
        <div className="stat-card"><h3>{doctors.length}</h3><p>Doctors</p></div>
        <div className="stat-card"><h3>{patients.length}</h3><p>Patients</p></div>
        <div className="stat-card"><h3>{appointments.length}</h3><p>Appointments</p></div>
        <div className="stat-card"><h3>{appointments.filter((a) => a.status === 'pending').length}</h3><p>Pending Approval</p></div>
      </div>

      <div className="tabs">
        <button className={tab === 'doctors' ? 'tab active' : 'tab'} onClick={() => setTab('doctors')}>Doctors</button>
        <button className={tab === 'patients' ? 'tab active' : 'tab'} onClick={() => setTab('patients')}>Patients</button>
        <button className={tab === 'appointments' ? 'tab active' : 'tab'} onClick={() => setTab('appointments')}>Appointments</button>
      </div>

      {tab === 'doctors' && (
        doctors.length === 0 ? (
          <p className="empty-state">No doctors added yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Specialization</th><th>Fee</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id}>
                  <td><Link to={`/doctors/${d._id}`}>Dr. {d.name}</Link></td>
                  <td>{d.specialization}</td>
                  <td>₹{d.consultationFee}</td>
                  <td><span className={`badge badge-${d.isActive ? 'open' : 'closed'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="action-cell">
                    <Link to={`/admin/doctors/${d._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleDoctorActive(d)}>
                      {d.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDoctor(d._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'patients' && (
        <>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by name or email"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="filter-input filter-search"
            />
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Action</th></tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td><span className={`badge badge-${p.status === 'active' ? 'open' : 'closed'}`}>{p.status}</span></td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => togglePatientStatus(p)}>
                      {p.status === 'active' ? 'Block' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'appointments' && (
        appointments.length === 0 ? (
          <p className="empty-state">No appointments booked yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Change Status</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patient?.name}</td>
                  <td>Dr. {a.doctor?.name}</td>
                  <td>{formatDate(a.date)}</td>
                  <td>{a.time}</td>
                  <td><span className={`badge badge-${a.status === 'confirmed' || a.status === 'completed' ? 'open' : 'closed'}`}>{a.status}</span></td>
                  <td>
                    <select value={a.status} onChange={(e) => changeAppointmentStatus(a._id, e.target.value)} className="filter-input">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
