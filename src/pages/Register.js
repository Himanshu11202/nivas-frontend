import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESIDENT',
    flatNumber: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Register attempt:', formData.email);
      
      // Simple direct API call
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        flatNumber: formData.flatNumber || null
      });
      
      console.log('Register successful:', response.data);
      
      const { token, id, email: userEmail, name, role, flatNumber, status } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, email: userEmail, name, role, flatNumber, status }));
      
      // Set axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update AuthContext
      setUser({ id, email: userEmail, name, role, flatNumber, status });
      
      // Simple navigation
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'RESIDENT') {
        navigate('/resident');
      } else if (role === 'GUARD') {
        navigate('/guard');
      } else {
        navigate('/login');
      }
      
    } catch (error) {
      console.error('Register error:', error);
      setError('Registration failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="register-card glass-card animate-slide-up">
        <div className="register-header">
          <h1 className="register-title gradient-text">Create Account</h1>
          <p className="register-subtitle">Join our society management system</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              className="glass-input"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="glass-input"
              required
              maxLength="15"
            />
          </div>

          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="glass-input"
              required
            >
              <option value="RESIDENT">Resident</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {(formData.role === 'RESIDENT' || formData.role === 'ADMIN') && (
            <div className="form-group">
              <input
                type="text"
                name="flatNumber"
                placeholder="Flat Number (e.g., A-101)"
                value={formData.flatNumber}
                onChange={handleChange}
                className="glass-input"
                required={formData.role === 'RESIDENT'}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login" className="login-link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
