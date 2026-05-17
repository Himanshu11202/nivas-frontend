import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getRouteForRole, saveAuthSession, refreshUserProfile } from '../utils/authStorage';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { login } = useAuth();
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
      console.log('Login attempt:', formData.email);
      console.log('API URL:', process.env.REACT_APP_API_URL || 'https://nivas-backend-we28.onrender.com');
      
      // API call with increased timeout and retry logic
      const maxRetries = 3;
      let lastError = null;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL || 'https://nivas-backend-we28.onrender.com'}/api/auth/login`, {
            email: formData.email,
            password: formData.password
          }, {
            timeout: 60000 // 60 seconds timeout
          });
          
          console.log('Login successful:', response.data);
          
          saveAuthSession(response.data);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

          let userPayload;
          try {
            userPayload = await refreshUserProfile();
          } catch {
            userPayload = saveAuthSession(response.data);
          }
          setUser(userPayload);

          const role = userPayload?.role || response.data.role;
          const route = getRouteForRole(role);
          if (!route) {
            setError(`Login OK but role "${role || 'unknown'}" is not supported. Contact admin.`);
            return;
          }

          navigate(route, { replace: true });
          return;
        } catch (error) {
          lastError = error;
          console.error(`Login attempt ${i + 1} failed:`, error);
          if (i < maxRetries - 1) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      
      // All retries failed
      throw lastError;
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="login-card glass-card animate-slide-up">
        <div className="login-header">
          <h1 className="login-title gradient-text">Society Management</h1>
          <p className="login-subtitle">Welcome back! Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
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
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" className="register-link">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
