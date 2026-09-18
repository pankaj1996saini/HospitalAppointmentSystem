import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import DoctorCard from '../components/DoctorCard';
import DoctorFilterBar from '../components/DoctorFilterBar';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const defaults = { search: '', specialization: '', day: '', sortBy: 'name', order: 'asc', page: 1 };

export default function DoctorCatalogue() {
  const [filters, setFilters] = useState(defaults);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...filters, limit: 9 };
      Object.keys(params).forEach((k) => { if (params[k] === '') delete params[k]; });
      const res = await api.get('/doctors', { params });
      setDoctors(res.data.data);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (err) {
      setError('Could not load doctors right now.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  function goToPage(p) {
    if (p < 1 || p > pagination.pages) return;
    setFilters({ ...filters, page: p });
  }

  return (
    <div className="page-container">
      <h1>Find a Doctor</h1>
      <DoctorFilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(defaults)} />

      <Alert message={error} />

      {loading ? (
        <Loader text="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <p className="empty-state">No doctors match your search. Try different filters.</p>
      ) : (
        <>
          <p className="results-count">{pagination.total} doctor(s) found</p>
          <div className="doctor-grid">
            {doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>← Prev</button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => goToPage(pagination.page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
