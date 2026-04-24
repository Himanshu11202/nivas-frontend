import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkersPage.css';

const WorkersPage = () => {
  const navigate = useNavigate();

  const workerTypes = [
    {
      id: 'maid',
      name: 'Maid / Cook',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      ),
      color: '#EC4899'
    },
    {
      id: 'plumber',
      name: 'Plumber',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v6"></path>
          <path d="M8 8h8v2a4 4 0 0 1-8 0V8z"></path>
          <path d="M8 14v4"></path>
          <path d="M16 14v4"></path>
          <path d="M6 18h12v4H6z"></path>
        </svg>
      ),
      color: '#3B82F6'
    },
    {
      id: 'electrician',
      name: 'Electrician',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
      ),
      color: '#F59E0B'
    },
    {
      id: 'carpenter',
      name: 'Carpenter',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 22h20"></path>
          <path d="M4 22V10l8-6 8 6v12"></path>
          <path d="M9 22v-6h6v6"></path>
        </svg>
      ),
      color: '#8B5CF6'
    },
    {
      id: 'painter',
      name: 'Painter',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
          <path d="M8.5 8.5v.01"></path>
          <path d="M16 15.5v.01"></path>
          <path d="M12 12v.01"></path>
          <path d="M8 16v.01"></path>
          <path d="M16 8v.01"></path>
        </svg>
      ),
      color: '#10B981'
    },
    {
      id: 'driver',
      name: 'Driver',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      ),
      color: '#6366F1'
    },
    {
      id: 'security',
      name: 'Security Guard',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
      color: '#EF4444'
    },
    {
      id: 'other',
      name: 'Other Worker',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
      color: '#6B7280'
    }
  ];

  return (
    <div className="workers-page">
      {/* Header */}
      <div className="workers-header">
        <button
          className="back-btn"
          onClick={() => navigate('/guard/dashboard')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </button>
        <h1 className="workers-title">Workers Entry</h1>
        <p className="workers-subtitle">Select worker type and register entry</p>
      </div>

      {/* Worker Types Grid */}
      <div className="worker-types-grid">
        {workerTypes.map((worker) => (
          <div
            key={worker.id}
            className="worker-type-card"
            style={{ '--worker-color': worker.color }}
            onClick={() => alert(`${worker.name} entry form coming soon!`)}
          >
            <div
              className="worker-icon-wrapper"
              style={{ backgroundColor: `${worker.color}15` }}
            >
              <div className="worker-icon" style={{ color: worker.color }}>
                {worker.icon}
              </div>
            </div>
            <span className="worker-name">{worker.name}</span>
          </div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="coming-soon-notice">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <p>Full worker management system coming soon!</p>
      </div>
    </div>
  );
};

export default WorkersPage;
