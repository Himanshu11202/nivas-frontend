import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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
      setLoading(true);
      const response = await axios.get('/api/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      setUpdatingId(complaintId);
      await axios.put(`/api/complaints/${complaintId}`, { status: newStatus });
      fetchComplaints();
      alert('Complaint status updated successfully!');
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Error updating complaint status');
    } finally {
      setUpdatingId(null);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="complaint-management">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-management">
      <div className="page-header">
        <h2>📋 Complaint Management</h2>
        <div className="stats">
          <span className="total-complaints">
            Total: {complaints.length}
          </span>
          <span className="pending-count">
            Pending: {complaints.filter(c => c.status === 'PENDING').length}
          </span>
        </div>
      </div>

      <div className="complaints-container">
        {complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <path d="M15 3h6v6" />
              </svg>
            </div>
            <h3>No Complaints</h3>
            <p>No complaints have been submitted yet.</p>
          </div>
        ) : (
          <div className="complaints-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Resident</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>#{complaint.id}</td>
                    <td className="complaint-title">{complaint.title}</td>
                    <td>{complaint.user?.name}</td>
                    <td>
                      <span className="category-badge">
                        {complaint.category}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(complaint.status)}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>{formatDate(complaint.createdAt)}</td>
                    <td>
                      <select
                        value={complaint.status}
                        onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                        disabled={updatingId === complaint.id}
                        className="status-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;
