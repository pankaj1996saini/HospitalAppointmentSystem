import React from 'react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorFilterBar({ filters, onChange, onReset }) {
  function handleInput(e) {
    onChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        name="search"
        placeholder="Search by doctor name or qualification..."
        value={filters.search}
        onChange={handleInput}
        className="filter-input filter-search"
      />
      <input
        type="text"
        name="specialization"
        placeholder="Specialization (e.g. Cardiology)"
        value={filters.specialization}
        onChange={handleInput}
        className="filter-input"
      />
      <select name="day" value={filters.day} onChange={handleInput} className="filter-input">
        <option value="">Any day</option>
        {WEEKDAYS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select name="sortBy" value={filters.sortBy} onChange={handleInput} className="filter-input">
        <option value="name">Sort: Name</option>
        <option value="experience">Sort: Experience</option>
        <option value="consultationFee">Sort: Fee</option>
      </select>
      <button type="button" className="btn btn-secondary" onClick={onReset}>Reset</button>
    </div>
  );
}
