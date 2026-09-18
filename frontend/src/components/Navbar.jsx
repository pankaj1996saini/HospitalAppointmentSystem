import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">🏥 MediCare</Link>
        <div className="navbar-links">
          <Link to="/doctors">Find a Doctor</Link>
          {user && user.role === 'patient' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-appointments">My Appointments</Link>
            </>
          )}
          {user && user.role === 'admin' && <Link to="/admin/dashboard">Admin Panel</Link>}

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-nav">Register</Link>
            </>
          ) : (
            <div className="navbar-user">
              <span className="navbar-username">{user.name} <small>({user.role})</small></span>
              <button className="btn-nav btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
