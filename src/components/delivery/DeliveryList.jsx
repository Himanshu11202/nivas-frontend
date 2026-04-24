import React from 'react';
import './DeliveryList.css';

const DeliveryList = ({ deliveries, onMarkDelivered, loading }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'DELIVERED':
        return 'status-delivered';
      default:
        return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return status || 'Unknown';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="delivery-list-empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
            <path d="M8 11l2 2 4-4"></path>
          </svg>
        </div>
        <h3 className="empty-title">No deliveries found</h3>
        <p className="empty-subtitle">Select a delivery app and send a request to get started</p>
      </div>
    );
  }

  return (
    <div className="delivery-list-container">
      <h3 className="list-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Today's Deliveries ({deliveries.length})
      </h3>

      <div className="delivery-table-wrapper">
        <table className="delivery-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Flat</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="delivery-row">
                <td className="cell-type">
                  <div className="type-info">
                    <div className="type-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </div>
                    <span className="type-name">{delivery.deliveryType}</span>
                  </div>
                </td>
                <td className="cell-flat">
                  <span className="flat-badge">{delivery.flatNumber}</span>
                </td>
                <td className="cell-time">
                  <span className="time-text">{formatTime(delivery.createdAt || delivery.entryTime)}</span>
                </td>
                <td className="cell-status">
                  <span className={`status-badge ${getStatusColor(delivery.status)}`}>
                    {getStatusLabel(delivery.status)}
                  </span>
                </td>
                <td className="cell-action">
                  {delivery.status?.toUpperCase() === 'APPROVED' ? (
                    <button
                      onClick={() => onMarkDelivered(delivery.id)}
                      disabled={loading}
                      className={`mark-delivered-btn ${loading ? 'loading' : ''}`}
                    >
                      {loading ? (
                        <span className="btn-spinner"></span>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Mark Delivered
                        </>
                      )}
                    </button>
                  ) : delivery.status?.toUpperCase() === 'DELIVERED' ? (
                    <span className="completed-text">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Completed
                    </span>
                  ) : (
                    <span className="waiting-text">
                      {delivery.status?.toUpperCase() === 'PENDING' ? 'Waiting for approval' : 'Not available'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryList;
