import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaintenanceCollectionDashboard.css';

const MaintenanceCollectionDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPendingPayments: 0,
    activeSocieties: 0,
    blockedSocieties: 0,
    totalSocieties: 0
  });
  const [societies, setSocieties] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceStats();
    fetchSocieties();
  }, []);

  const fetchMaintenanceStats = async () => {
    try {
      const response = await axios.get('/api/super-admin/maintenance-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await axios.get('/api/super-admin/societies');
      setSocieties(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching societies:', error);
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/super-admin/societies/${selectedSociety.id}/payment`, {
        amount: parseFloat(paymentAmount)
      });
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedSociety(null);
      fetchMaintenanceStats();
      fetchSocieties();
    } catch (error) {
      alert('Error recording payment: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSetMaintenanceAmount = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/super-admin/societies/${selectedSociety.id}/maintenance-amount`, {
        amount: parseFloat(maintenanceAmount)
      });
      alert('Maintenance amount updated successfully!');
      setShowAmountModal(false);
      setMaintenanceAmount('');
      setSelectedSociety(null);
      fetchSocieties();
    } catch (error) {
      alert('Error updating maintenance amount: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateStatus = async (societyId, status) => {
    try {
      await axios.put(`/api/super-admin/societies/${societyId}/status`, { status });
      alert('Society status updated successfully!');
      fetchMaintenanceStats();
      fetchSocieties();
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="maintenance-collection-dashboard">
      <div className="dashboard-header">
        <h1>Maintenance Collection Dashboard</h1>
        <button onClick={() => { fetchMaintenanceStats(); fetchSocieties(); }} className="btn-refresh">
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Payments</h3>
          <p className="stat-value">₹{stats.totalPendingPayments.toLocaleString()}</p>
        </div>
        <div className="stat-card active">
          <h3>Active Societies</h3>
          <p className="stat-value">{stats.activeSocieties}</p>
        </div>
        <div className="stat-card blocked">
          <h3>Blocked Societies</h3>
          <p className="stat-value">{stats.blockedSocieties}</p>
        </div>
        <div className="stat-card total">
          <h3>Total Societies</h3>
          <p className="stat-value">{stats.totalSocieties}</p>
        </div>
      </div>

      {/* Societies Table */}
      <div className="societies-table-container">
        <h2>Society Maintenance Status</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="societies-table">
            <thead>
              <tr>
                <th>Society Name</th>
                <th>Code</th>
                <th>Maintenance Amount</th>
                <th>Total Revenue</th>
                <th>Pending Payments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {societies.map((society) => (
                <tr key={society.id}>
                  <td>{society.name}</td>
                  <td>{society.societyCode}</td>
                  <td>₹{society.maintenanceAmount?.toLocaleString() || 1000}</td>
                  <td>₹{(society.totalRevenue || 0).toLocaleString()}</td>
                  <td>₹{(society.pendingPayments || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${society.subscriptionStatus?.toLowerCase()}`}>
                      {society.subscriptionStatus || 'ACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          setSelectedSociety(society);
                          setShowPaymentModal(true);
                        }}
                        className="btn-payment"
                      >
                        Record Payment
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSociety(society);
                          setMaintenanceAmount(society.maintenanceAmount?.toString() || '1000');
                          setShowAmountModal(true);
                        }}
                        className="btn-amount"
                      >
                        Set Amount
                      </button>
                      {society.subscriptionStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(society.id, 'BLOCKED')}
                          className="btn-block"
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(society.id, 'ACTIVE')}
                          className="btn-unblock"
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSociety && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p><strong>Society:</strong> {selectedSociety.name}</p>
              <p><strong>Pending:</strong> ₹{(selectedSociety.pendingPayments || 0).toLocaleString()}</p>
              <form onSubmit={handleRecordPayment}>
                <div className="form-group">
                  <label>Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    min="1"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Record Payment</button>
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Set Maintenance Amount Modal */}
      {showAmountModal && selectedSociety && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Set Maintenance Amount</h2>
              <button onClick={() => setShowAmountModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <p><strong>Society:</strong> {selectedSociety.name}</p>
              <form onSubmit={handleSetMaintenanceAmount}>
                <div className="form-group">
                  <label>Monthly Maintenance Amount (₹)</label>
                  <input
                    type="number"
                    value={maintenanceAmount}
                    onChange={(e) => setMaintenanceAmount(e.target.value)}
                    required
                    min="1"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Update Amount</button>
                  <button type="button" onClick={() => setShowAmountModal(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCollectionDashboard;
