import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './VisitorApproval.css';

const VisitorApproval = () => {
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchVisitorRequests();
    // Set up polling for real-time updates
    const interval = setInterval(fetchVisitorRequests, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchVisitorRequests = async () => {
    try {
      console.log('Fetching visitors for flat:', user?.flatNumber);
      const response = await axios.get(`/api/resident/visitors/my-flat?flatNumber=${user?.flatNumber}`);
      console.log('API Response:', response.data);
      // Filter only PENDING visitors for approval
      const pendingVisitors = response.data?.filter(v => v.status === 'PENDING') || [];
      console.log('Pending visitors:', pendingVisitors);
      setVisitorRequests(pendingVisitors);
    } catch (error) {
      console.error('Error fetching visitor requests:', error);
      setVisitorRequests([]);
    }
  };

  const handleApprove = async (visitorId) => {
    setActionLoading(prev => ({ ...prev, [visitorId]: true }));
    try {
      console.log('Approving visitor ID:', visitorId);
      const response = await axios.patch(`/api/resident/visitors/${visitorId}/approve`);
      console.log('Approve response:', response.data);
      alert('Visitor approved successfully!');
      fetchVisitorRequests();
    } catch (error) {
      console.error('Error approving visitor:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      alert('Error approving visitor: ' + (error.response?.data || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [visitorId]: false }));
    }
  };

  const handleReject = async (visitorId) => {
    setActionLoading(prev => ({ ...prev, [visitorId]: true }));
    try {
      await axios.patch(`/api/resident/visitors/${visitorId}/reject`);
      alert('Visitor rejected successfully!');
      fetchVisitorRequests();
    } catch (error) {
      console.error('Error rejecting visitor:', error);
      alert('Error rejecting visitor');
    } finally {
      setActionLoading(prev => ({ ...prev, [visitorId]: false }));
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="visitor-approval">
      <div className="page-header">
        <h2>Visitor Requests</h2>
        <div className="header-info">
          <span className="flat-badge">Flat {user?.flatNumber}</span>
        </div>
      </div>

      <div className="visitor-content">
        {visitorRequests.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <path d="M20 8v6M23 11h-6"></path>
            </svg>
            <h3>No Visitor Requests</h3>
            <p>You don't have any pending visitor requests</p>
          </div>
        ) : (
          <div className="visitor-requests-grid">
            {visitorRequests.map((visitor) => (
              <div key={visitor.id} className="visitor-request-card">
                <div className="visitor-photo">
                  {visitor.visitorPhoto ? (
                    <img src={visitor.visitorPhoto} alt={visitor.visitorName} />
                  ) : (
                    <div className="photo-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="visitor-info">
                  <h3>{visitor.visitorName}</h3>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{visitor.visitorPhone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Purpose:</span>
                    <span className="value">{visitor.purpose}</span>
                  </div>
                  {visitor.vehicleNumber && (
                    <div className="info-row">
                      <span className="label">Vehicle:</span>
                      <span className="value">{visitor.vehicleNumber}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Request Time:</span>
                    <span className="value">{formatTime(visitor.createdAt)}</span>
                  </div>
                </div>
                
                <div className="visitor-actions">
                  <button
                    onClick={() => handleApprove(visitor.id)}
                    disabled={actionLoading[visitor.id]}
                    className="btn-approve"
                  >
                    {actionLoading[visitor.id] ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(visitor.id)}
                    disabled={actionLoading[visitor.id]}
                    className="btn-reject"
                  >
                    {actionLoading[visitor.id] ? '...' : 'Reject'}
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

export default VisitorApproval;
