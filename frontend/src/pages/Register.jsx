import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const initialForm = {
  name: '', email: '', password: '', confirmPassword: '',
  phone: '', dob: '', gender: '', address: '',
};

export default function Register() {
  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.name.trim()) return 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password needs to be at least 6 characters.';
    if (form.password !== form.confirmPassword) return "Passwords don't match.";
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!form.dob) return 'Date of birth is required.';
    if (!form.gender) return 'Please select a gender.';
    if (!form.address.trim()) return 'Address is required.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');

    const { confirmPassword, ...payload } = form;
    const result = await register(payload);
    if (result.success) navigate('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h2>Patient Registration</h2>
        <p className="auth-subtitle">Create an account to book appointments</p>
        <Alert message={formError || error} />
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="First Last Name" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input id="dob" type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input id="address" type="text" name="address" value={form.address} onChange={handleChange} placeholder="Street, City" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
