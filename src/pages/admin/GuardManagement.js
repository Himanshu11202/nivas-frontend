import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GuardManagement.css';

const GuardManagement = () => {
  const [guards, setGuards] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    address: '',
    shift: 'Day',
    salary: '',
    status: 'ACTIVE'
  });
  const [editingGuard, setEditingGuard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/guards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGuards(response.data);
    } catch (error) {
      console.error('Error fetching guards:', error);
      setGuards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting guard data:', formData);
      
      // Use direct API call to avoid issues
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/admin/guards`, formData);
      console.log('Guard created response:', response.data);
      
      // Reset form
      setFormData({ 
        name: '', 
        phoneNumber: '', 
        email: '', 
        password: '',
        address: '',
        shift: 'Day',
        salary: '',
        status: 'ACTIVE'
      });
      setEditingGuard(null);
      fetchGuards();
      
      alert('Guard created successfully!');
    } catch (error) {
      console.error('Error saving guard:', error);
      console.error('Error details:', error.response?.data);
      alert('Error saving guard: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guard?')) {
      try {
        await axios.delete(`/api/admin/guards/${id}`);
        fetchGuards();
      } catch (error) {
        console.error('Error deleting guard:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-badge active';
      case 'INACTIVE':
        return 'status-badge inactive';
      case 'ON_LEAVE':
        return 'status-badge leave';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="guard-management">
      <div className="page-header">
        <h2>🛡️ Guard Management</h2>
        <button 
          className="add-guard-btn"
          onClick={() => setEditingGuard({})}
        >
          Add Guard
        </button>
      </div>

      <div className="guard-form-container">
        <form onSubmit={handleSubmit} className="guard-form">
          <h3>{editingGuard ? 'Edit Guard' : 'Add New Guard'}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="form-input"
                required={editingGuard ? false : true}
                placeholder={editingGuard ? "Leave blank to keep current" : "Enter password"}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="form-input"
                required
              >
                <option value="Day">Day</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : (editingGuard ? 'Update Guard' : 'Add Guard')}
            </button>
            <button type="button" className="cancel-btn" onClick={() => {
              setEditingGuard(null);
              setFormData({ 
                name: '', 
                phoneNumber: '', 
                email: '', 
                password: '',
                address: '',
                shift: 'Day',
                salary: '',
                status: 'ACTIVE'
              });
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="guards-list-container">
        <h3>Security Guards</h3>
        {guards.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No guards found</h3>
            <p>Add your first security guard!</p>
          </div>
        ) : (
          <div className="guards-grid">
            {guards.map(guard => (
              <div key={guard.id} className="guard-card">
                <div className="guard-info">
                  <h4>{guard.name}</h4>
                  <p>Email: {guard.email}</p>
                  <p>Phone: {guard.phoneNumber}</p>
                  <p>Shift: {guard.shift}</p>
                  <p>Salary: ${guard.salary}</p>
                </div>
                <div className="guard-actions">
                  <button className="edit-btn" onClick={() => setEditingGuard(guard)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(guard.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardManagement;
