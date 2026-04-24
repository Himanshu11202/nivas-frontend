import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CameraCapture from '../../components/CameraCapture';
import './VisitorManagement.css';

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState([]);
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    flatNumber: '',
    purpose: '',
    vehicleNumber: ''
  });
  const [showCamera, setShowCamera] = useState(false);
  const [visitorPhoto, setVisitorPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchVisitors();
    fetchVisitorRequests();
  }, []);

  const fetchVisitors = async () => {
    try {
      const response = await axios.get('/api/guard/visitors');
      setVisitors(response.data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setVisitors([]);
    }
  };

  const fetchVisitorRequests = async () => {
    try {
      const response = await axios.get('/api/guard/visitors/pending');
      setVisitorRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching visitor requests:', error);
      setVisitorRequests([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCameraCapture = (photoFile) => {
    setVisitorPhoto(photoFile);
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!visitorPhoto) {
      alert('Photo is required. Please capture visitor photo.');
      return;
    }

    setLoading(true);
    try {
      // Create visitor request with PENDING status
      const formDataToSend = new FormData();
      formDataToSend.append('visitorName', formData.visitorName);
      formDataToSend.append('visitorPhone', formData.visitorPhone);
      formDataToSend.append('flatNumber', formData.flatNumber);
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('vehicleNumber', formData.vehicleNumber);
      formDataToSend.append('visitorPhoto', visitorPhoto);
      formDataToSend.append('status', 'PENDING');

      const response = await axios.post('/api/guard/visitors', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Send notification to resident
      try {
        await axios.post('/api/notifications/visitor-request', {
          flatNumber: formData.flatNumber,
          visitorName: formData.visitorName,
          visitorId: response.data.id,
          message: `Visitor ${formData.visitorName} is requesting entry for flat ${formData.flatNumber}. Purpose: ${formData.purpose}`
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      alert('Visitor request sent to resident for approval!');
      setFormData({
        visitorName: '',
        visitorPhone: '',
        flatNumber: '',
        purpose: '',
        vehicleNumber: ''
      });
      setVisitorPhoto(null);
      fetchVisitorRequests();
      fetchVisitors();
    } catch (error) {
      console.error('Error creating visitor request:', error);
      alert('Error creating visitor request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async (visitorId) => {
    setActionLoading(prev => ({ ...prev, [visitorId]: true }));
    try {
      await axios.post(`/api/guard/visitors/${visitorId}/entry`);
      alert('Visitor entry recorded successfully!');
      fetchVisitors();
    } catch (error) {
      console.error('Error recording entry:', error);
      alert('Error recording visitor entry');
    } finally {
      setActionLoading(prev => ({ ...prev, [visitorId]: false }));
    }
  };

  const handleExit = async (visitorId) => {
    setActionLoading(prev => ({ ...prev, [visitorId]: true }));
    try {
      await axios.post(`/api/guard/visitors/${visitorId}/exit`);
      alert('Visitor exit recorded successfully!');
      fetchVisitors();
    } catch (error) {
      console.error('Error recording exit:', error);
      alert('Error recording visitor exit');
    } finally {
      setActionLoading(prev => ({ ...prev, [visitorId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ENTERED: 'bg-green-100 text-green-800',
      EXITED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return `status-badge ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="visitor-management">
      <div className="page-header">
        <h2>Visitor Management</h2>
        <div className="header-stats">
          <span className="stat">Active: {visitors.filter(v => v.status === 'ENTERED').length}</span>
          <span className="stat">Pending: {visitorRequests.filter(v => v.status === 'PENDING').length}</span>
        </div>
      </div>

      <div className="visitor-content">
        <div className="visitor-form-card">
          <h3>Create Visitor Request</h3>
          <form onSubmit={handleSubmit} className="visitor-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Visitor Name *</label>
                <input
                  type="text"
                  name="visitorName"
                  value={formData.visitorName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter visitor name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="visitorPhone"
                  value={formData.visitorPhone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Flat Number *</label>
                <input
                  type="text"
                  name="flatNumber"
                  value={formData.flatNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., A-101"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Purpose *</label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  placeholder="Visit purpose"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="Vehicle number (optional)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Visitor Photo *</label>
                <div className="photo-section">
                  {visitorPhoto ? (
                    <div className="photo-preview">
                      <img src={URL.createObjectURL(visitorPhoto)} alt="Visitor" />
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="btn-retake"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="btn-capture"
                    >
                      Capture Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !visitorPhoto}
              className="btn-submit"
            >
              {loading ? 'Creating Request...' : 'Send Request to Resident'}
            </button>
          </form>
        </div>

        <div className="visitor-lists">
          {/* Pending Requests */}
          <div className="visitor-list-card">
            <h3>Pending Requests</h3>
            {visitorRequests.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h4>No Pending Requests</h4>
                <p>Visitor requests will appear here</p>
              </div>
            ) : (
              <div className="visitor-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Flat</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorRequests.map((visitor) => (
                      <tr key={visitor.id}>
                        <td className="visitor-name">{visitor.visitorName}</td>
                        <td>
                          <span className="flat-badge">{visitor.flatNumber}</span>
                        </td>
                        <td>{visitor.purpose}</td>
                        <td>
                          <span className={getStatusBadge(visitor.status)}>
                            {visitor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Approved Visitors */}
          <div className="visitor-list-card">
            <h3>Approved Visitors</h3>
            {visitors.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <path d="M20 8v6M23 11h-6"></path>
                </svg>
                <h4>No Approved Visitors</h4>
                <p>Approved visitors will appear here</p>
              </div>
            ) : (
              <div className="visitor-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Flat</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Entry Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td className="visitor-name">{visitor.visitorName}</td>
                        <td>{visitor.visitorPhone}</td>
                        <td>
                          <span className="flat-badge">{visitor.flatNumber}</span>
                        </td>
                        <td>{visitor.purpose}</td>
                        <td>
                          <span className={getStatusBadge(visitor.status)}>
                            {visitor.status}
                          </span>
                        </td>
                        <td>{formatTime(visitor.entryTime)}</td>
                        <td>
                          <div className="action-buttons">
                            {visitor.status === 'APPROVED' && (
                              <button
                                onClick={() => handleEntry(visitor.id)}
                                disabled={actionLoading[visitor.id]}
                                className="btn-entry"
                              >
                                {actionLoading[visitor.id] ? '...' : 'Entry'}
                              </button>
                            )}
                            {visitor.status === 'ENTERED' && (
                              <button
                                onClick={() => handleExit(visitor.id)}
                                disabled={actionLoading[visitor.id]}
                                className="btn-exit"
                              >
                                {actionLoading[visitor.id] ? '...' : 'Exit'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          title="Capture Visitor Photo"
        />
      )}
    </div>
  );
};

export default VisitorManagement;
