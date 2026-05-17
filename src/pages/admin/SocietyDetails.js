import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SocietyDetails.css';

const SocietyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [society, setSociety] = useState(null);
  const [societyAdmin, setSocietyAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSocietyDetails();
    fetchSocietyMembers();
  }, [id]);

  const fetchSocietyDetails = async () => {
    try {
      const response = await axios.get(`/api/super-admin/societies/id/${id}`);
      setSociety(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching society details:', error);
      setLoading(false);
    }
  };

  const fetchSocietyMembers = async () => {
    try {
      const response = await axios.get(`/api/super-admin/societies/${id}/members`);
      const allMembers = response.data || [];
      const adminMember = allMembers.find(m => m.role === 'SOCIETY_ADMIN');
      setMembers(allMembers);
      setSocietyAdmin(adminMember);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await axios.post(`/api/super-admin/societies/${id}/payment`, {
        amount: society.maintenanceAmount || 1000
      });
      alert('Maintenance marked as paid!');
      fetchSocietyDetails();
    } catch (error) {
      alert('Error marking as paid: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSociety = async () => {
    try {
      await axios.delete(`/api/super-admin/societies/${id}`);
      alert('Society deleted successfully!');
      navigate('/super-admin');
    } catch (error) {
      alert('Error deleting society: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!society) {
    return <div className="error">Society not found</div>;
  }

  const isPaid = society.subscriptionStatus === 'ACTIVE' && society.pendingPayments === 0;

  return (
    <div className="society-details-page">
      <div className="page-header">
        <button onClick={() => navigate('/super-admin/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h1>{society.name}</h1>
        <div className="header-actions">
          <button onClick={handleMarkAsPaid} className="btn-paid">
            {isPaid ? '✓ Paid' : 'Mark as Paid'}
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn-delete">
            Delete Society
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`status-banner ${isPaid ? 'paid' : 'pending'}`}>
        <div className="banner-content">
          <h2>{isPaid ? '✓ Maintenance Paid' : '⚠ Maintenance Pending'}</h2>
          <p>
            {isPaid 
              ? `All payments are up to date. Next payment due: ${new Date(society.subscriptionExpiryDate).toLocaleDateString()}`
              : `Pending: ₹${(society.pendingPayments || 0).toLocaleString()} - Please mark as paid to continue services`
            }
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Flats</h3>
          <p className="stat-value">{society.totalFlats || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Members</h3>
          <p className="stat-value">{members.length}</p>
        </div>
        <div className="stat-card">
          <h3>Maintenance Amount</h3>
          <p className="stat-value">₹{(society.maintenanceAmount || 1000).toLocaleString()}/month</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{(society.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">₹{(society.pendingPayments || 0).toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Status</h3>
          <span className={`status-badge ${society.subscriptionStatus?.toLowerCase()}`}>
            {society.subscriptionStatus || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h2>Analytics Overview</h2>
        <div className="charts-grid">
          {/* Revenue Chart */}
          <div className="chart-card">
            <h3>Revenue Overview</h3>
            <div className="chart-placeholder">
              <div className="bar-chart">
                <div className="bar" style={{ height: '60%' }}>
                  <span>₹{(society.totalRevenue * 0.3).toLocaleString()}</span>
                </div>
                <div className="bar" style={{ height: '80%' }}>
                  <span>₹{(society.totalRevenue * 0.5).toLocaleString()}</span>
                </div>
                <div className="bar" style={{ height: '100%' }}>
                  <span>₹{(society.totalRevenue * 0.7).toLocaleString()}</span>
                </div>
              </div>
              <div className="chart-labels">
                <span>Month 1</span>
                <span>Month 2</span>
                <span>Month 3</span>
              </div>
            </div>
          </div>

          {/* Payment Status Chart */}
          <div className="chart-card">
            <h3>Payment Status</h3>
            <div className="chart-placeholder pie-chart">
              <div className="pie">
                <div className="pie-segment paid" style={{ 
                  background: `conic-gradient(#10b981 ${isPaid ? 360 : 180}deg, #f59e0b ${isPaid ? 0 : 180}deg)`
                }}></div>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-color paid"></span>
                  <span>Paid: {isPaid ? '100%' : '50%'}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color pending"></span>
                  <span>Pending: {isPaid ? '0%' : '50%'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Members Growth Chart */}
          <div className="chart-card">
            <h3>Members Growth</h3>
            <div className="chart-placeholder">
              <div className="line-chart">
                <svg viewBox="0 0 300 150">
                  <polyline
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="3"
                    points="0,120 50,100 100,110 150,80 200,60 250,40 300,20"
                  />
                  <circle cx="0" cy="120" r="4" fill="#667eea" />
                  <circle cx="50" cy="100" r="4" fill="#667eea" />
                  <circle cx="100" cy="110" r="4" fill="#667eea" />
                  <circle cx="150" cy="80" r="4" fill="#667eea" />
                  <circle cx="200" cy="60" r="4" fill="#667eea" />
                  <circle cx="250" cy="40" r="4" fill="#667eea" />
                  <circle cx="300" cy="20" r="4" fill="#667eea" />
                </svg>
              </div>
              <div className="chart-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Society Information */}
      <div className="info-section">
        <h2>Society Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Society Code</label>
            <span>{society.societyCode}</span>
          </div>
          <div className="info-item">
            <label>Location</label>
            <span>{society.location || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Created On</label>
            <span>{new Date(society.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Last Payment</label>
            <span>{society.lastPaymentDate ? new Date(society.lastPaymentDate).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Subscription Expiry</label>
            <span>{new Date(society.subscriptionExpiryDate).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <label>Maintenance Due Date</label>
            <span>{society.maintenanceDueDate ? new Date(society.maintenanceDueDate).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Society Admin Section */}
      {societyAdmin && (
        <div className="admin-section">
          <h2>Society Admin Details</h2>
          <div className="admin-card">
            <h3>{societyAdmin.name}</h3>
            <p><strong>Email:</strong> {societyAdmin.email}</p>
            <p><strong>Phone:</strong> {societyAdmin.phoneNumber || 'N/A'}</p>
            <p><strong>Flat:</strong> {societyAdmin.flatNumber || 'N/A'}</p>
            <p><strong>Role:</strong> {societyAdmin.role}</p>
            <p><strong>Status:</strong> {societyAdmin.status}</p>
          </div>
        </div>
      )}

      {/* Members Section */}
      <div className="members-section">
        <h2>Society Members</h2>
        {members.length > 0 ? (
          <div className="members-grid">
            {members.map((member) => (
              <div key={member.id} className="member-card">
                <h3>{member.name}</h3>
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Flat:</strong> {member.flatNumber || 'N/A'}</p>
                <p><strong>Role:</strong> {member.role}</p>
                <p><strong>Status:</strong> {member.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-members">No members found</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Society</h2>
              <button onClick={() => setShowDeleteModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{society.name}</strong>?</p>
              <p className="warning">This action will also delete all members associated with this society. This cannot be undone.</p>
              <div className="modal-actions">
                <button onClick={handleDeleteSociety} className="btn-confirm-delete">
                  Confirm Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietyDetails;
