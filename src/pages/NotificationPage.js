import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/notifications/user/${user?.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`/api/notifications/user/${user?.id}/read-all`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`/api/notifications/${notificationId}`);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      VISITOR_REQUEST: '👤',
      VISITOR_APPROVAL: '✅',
      COMPLAINT_UPDATE: '📋',
      NEW_NOTICE: '📢',
      WORKER_ATTENDANCE: '⏰'
    };
    return icons[type] || '📢';
  };

  if (loading) {
    return (
      <div className="notification-page">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="page-header">
        <h2>Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <button 
            className="mark-all-read-btn"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-container">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 2c-3.314 0-6 2.686-6 6v9l-2 2v1h16v-1l-2-2V8z" />
                <path d="M13 22h-2a1 1 0 01-1-1v-1h4v1a1 1 0 01-1 1z" />
              </svg>
            </div>
            <h3>No Notifications</h3>
            <p>You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-header">
                  <div className="notification-icon">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="notification-meta">
                    <span className="notification-type">{notification.type}</span>
                    <span className="notification-date">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        className="btn-read"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                          <path d="M20 12H4" />
                        </svg>
                      </button>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
