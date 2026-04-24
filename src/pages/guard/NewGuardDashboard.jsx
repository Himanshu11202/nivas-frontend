import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './GuardDashboard.css';

const GuardDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      id: 'guest',
      title: 'Guest',
      subtitle: 'Visitor Entry',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      color: '#4F46E5',
      onClick: () => navigate('/guard/guest')
    },
    {
      id: 'delivery',
      title: 'Delivery',
      subtitle: 'Food & Packages',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <path d="M8 11l2 2 4-4"></path>
        </svg>
      ),
      color: '#F59E0B',
      onClick: () => navigate('/guard/delivery')
    },
    {
      id: 'workers',
      title: 'Workers',
      subtitle: 'Staff & Services',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4"></circle>
          <path d="M18 21v-2a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v2"></path>
          <path d="M12 2v2"></path>
          <path d="M12 14v2"></path>
          <path d="M4.93 4.93l1.41 1.41"></path>
          <path d="M17.66 17.66l1.41 1.41"></path>
          <path d="M1 12h2"></path>
          <path d="M21 12h2"></path>
          <path d="M4.93 19.07l1.41-1.41"></path>
          <path d="M17.66 6.34l1.41-1.41"></path>
        </svg>
      ),
      color: '#10B981',
      onClick: () => navigate('/guard/workers')
    }
  ];

  return (
    <div className="new-guard-dashboard">
      <div className="dashboard-header">
        <h1 className="welcome-title">Welcome, {user?.name}!</h1>
        <p className="welcome-subtitle">Manage entry and exit operations</p>
      </div>

      <div className="dashboard-cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="dashboard-action-card"
            onClick={card.onClick}
            style={{ '--card-color': card.color }}
          >
            <div className="card-icon-wrapper" style={{ backgroundColor: `${card.color}15` }}>
              <div className="card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-subtitle">{card.subtitle}</p>
            </div>
            <div className="card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardDashboard;
