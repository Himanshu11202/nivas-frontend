import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VisitorLogs.css';

const VisitorLogs = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/visitors');
      setVisitors(response.data);
    } catch (error) {
      console.error('Error fetching visitor logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesFilter = filter === 'ALL' || visitor.status === filter;
    const matchesSearch = visitor.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      ENTERED: 'bg-green-100 text-green-800',
      EXITED: 'bg-gray-100 text-gray-800'
    };
    return `status-badge ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="visitor-logs">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading visitor logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="visitor-logs">
      <div className="page-header">
        <h2>👥 Visitor Logs</h2>
        <div className="stats">
          <span className="total-visitors">
            Total: {visitors.length}
          </span>
          <span className="active-visitors">
            Active: {visitors.filter(v => v.status === 'ENTERED').length}
          </span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Visitors</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ENTERED">Entered</option>
              <option value="EXITED">Exited</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="search-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name or flat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="visitors-container">
        {filteredVisitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <h3>No Visitors Found</h3>
            <p>No visitors match your current filters.</p>
          </div>
        ) : (
          <div className="visitors-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Visitor Name</th>
                  <th>Phone</th>
                  <th>Flat Number</th>
                  <th>Purpose</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td>#{visitor.id}</td>
                    <td className="visitor-name">{visitor.visitorName}</td>
                    <td>{visitor.visitorPhone}</td>
                    <td>
                      <span className="flat-badge">
                        {visitor.flatNumber}
                      </span>
                    </td>
                    <td>{visitor.purpose}</td>
                    <td>{visitor.vehicleNumber || 'N/A'}</td>
                    <td>
                      <span className={getStatusBadge(visitor.status)}>
                        {visitor.status}
                      </span>
                    </td>
                    <td>{formatDateTime(visitor.entryTime)}</td>
                    <td>{formatDateTime(visitor.exitTime)}</td>
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

export default VisitorLogs;
