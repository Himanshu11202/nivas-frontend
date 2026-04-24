import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResidentApproval.css';

const ResidentApproval = () => {
  const [pendingResidents, setPendingResidents] = useState([]);

  useEffect(() => {
    fetchPendingResidents();
  }, []);

  const fetchPendingResidents = async () => {
    try {
      const response = await axios.get('/api/admin/residents/pending');
      setPendingResidents(response.data);
    } catch (error) {
      console.error('Error fetching pending residents:', error);
    }
  };

  const handleApprove = async (residentId) => {
    try {
      const response = await axios.post(`/api/admin/residents/${residentId}/approve`);
      fetchPendingResidents();
      alert(response.data.message || 'Resident approved successfully!');
    } catch (error) {
      console.error('Error approving resident:', error);
      alert(error.response?.data?.error || 'Error approving resident');
    }
  };

  const handleReject = async (residentId) => {
    if (window.confirm('Are you sure you want to reject this resident application?')) {
      try {
        const response = await axios.post(`/api/admin/residents/${residentId}/reject`);
        fetchPendingResidents();
        alert(response.data.message || 'Resident rejected successfully!');
      } catch (error) {
        console.error('Error rejecting resident:', error);
        alert(error.response?.data?.error || 'Error rejecting resident');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="resident-approval">
      <div className="page-header">
        <h2>Pending Resident Approvals</h2>
        <div className="stats">
          <span className="pending-count">
            {pendingResidents.length} Pending Applications
          </span>
        </div>
      </div>

      <div className="residents-container">
        {pendingResidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <h3>No Pending Applications</h3>
            <p>All resident applications have been processed.</p>
          </div>
        ) : (
          <div className="residents-grid">
            {pendingResidents.map((resident) => (
              <div key={resident.id} className="resident-card">
                <div className="resident-header">
                  <div className="resident-info">
                    <h3 className="resident-name">{resident.name}</h3>
                    <span className="status-badge pending">
                      PENDING
                    </span>
                  </div>
                  <div className="resident-date">
                    Applied: {formatDate(resident.createdAt)}
                  </div>
                </div>
                
                <div className="resident-details">
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{resident.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{resident.phoneNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Flat Number:</span>
                    <span className="detail-value">{resident.flatNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{resident.role}</span>
                  </div>
                </div>
                
                <div className="resident-actions">
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprove(resident.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                      <path d="M20 12H4" />
                    </svg>
                    Approve
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(resident.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Reject
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

export default ResidentApproval;
