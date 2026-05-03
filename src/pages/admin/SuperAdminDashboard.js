import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [societies, setSocieties] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  useEffect(() => {
    fetchSocieties();
    fetchAdmins();
  }, []);

  const fetchSocieties = async () => {
    try {
      const response = await axios.get('/api/super-admin/societies');
      setSocieties(response.data);
    } catch (error) {
      console.error('Error fetching societies:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('/api/super-admin/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/super-admin/societies', formData);
      alert(response.data.message);
      setFormData({ name: '', location: '' });
      setShowCreateForm(false);
      fetchSocieties();
    } catch (error) {
      alert('Error creating society: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Society'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-society-form">
          <h2>Create New Society</h2>
          <form onSubmit={handleCreateSociety}>
            <div className="form-group">
              <label>Society Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter society name"
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location (optional)"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Society</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Societies</h3>
            <p className="stat-value">{societies.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Society Admins</h3>
            <p className="stat-value">{admins.length}</p>
          </div>
        </div>

        <div className="societies-section">
          <h2>All Societies</h2>
          <div className="societies-grid">
            {societies.map((society) => (
              <div key={society.id} className="society-card">
                <div className="society-header">
                  <h3>{society.name}</h3>
                  <span className="society-code">{society.societyCode}</span>
                </div>
                {society.location && (
                  <p className="society-location">📍 {society.location}</p>
                )}
                <p className="society-date">
                  Created: {new Date(society.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="admins-section">
          <h2>Society Admins</h2>
          <div className="admins-grid">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-card">
                <h3>{admin.name}</h3>
                <p>{admin.email}</p>
                <p className="admin-phone">{admin.phoneNumber}</p>
                <span className="status-badge active">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
