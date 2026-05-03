import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        const response = await axios.get(`/api/notifications/user/${user.id}`);
        setNotifications(response.data);
        
        const unreadResponse = await axios.get(`/api/notifications/user/${user.id}/unread-count`);
        setUnreadCount(unreadResponse.data.count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications([notification, ...notifications]);
    setUnreadCount(unreadCount + 1);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    showNotifications,
    setShowNotifications,
    fetchNotifications,
    markAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
