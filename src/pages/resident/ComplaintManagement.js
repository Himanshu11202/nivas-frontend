import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MAINTENANCE'
  });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchComplaints();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/complaints/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/complaints', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFormData({ title: '', description: '', category: 'MAINTENANCE' });
      setShowForm(false);
      fetchComplaints();
      alert('Complaint submitted successfully!');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      console.error('Error response:', error.response?.data);
      alert('Error submitting complaint: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800'
    };
    return `status-badge ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      MAINTENANCE: 'bg-purple-100 text-purple-800',
      SECURITY: 'bg-red-100 text-red-800',
      NOISE: 'bg-orange-100 text-orange-800',
      CLEANLINESS: 'bg-green-100 text-green-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return `category-badge ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="complaint-management">
      <div className="page-header">
        <h2>My Complaints</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          File New Complaint
        </button>
      </div>

      {showForm && (
        <div className="complaint-form-overlay">
          <div className="complaint-form-container">
            <div className="form-header">
              <h3>File New Complaint</h3>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#000000',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-input"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#000000',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="SECURITY">Security</option>
                  <option value="NOISE">Noise</option>
                  <option value="CLEANLINESS">Cleanliness</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#000000',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Detailed description of the issue"
                  rows={6}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Submit Complaint
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="complaints-container">
        {complaints.length === 0 ? (
          <div className="empty-state">
            <h3>No complaints filed</h3>
            <p>Click "File New Complaint" to report an issue.</p>
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <h3 className="complaint-title">{complaint.title}</h3>
                  <span className={getStatusBadge(complaint.status)}>
                    {complaint.status}
                  </span>
                </div>
                
                <div className="complaint-meta">
                  <span className={getCategoryBadge(complaint.category)}>
                    {complaint.category}
                  </span>
                  <span className="complaint-date">
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>
                
                <div className="complaint-content">
                  <p>{complaint.description}</p>
                </div>
                
                {complaint.resolvedAt && (
                  <div className="resolved-info">
                    <span className="resolved-label">Resolved on:</span>
                    <span className="resolved-date">
                      {formatDate(complaint.resolvedAt)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;
