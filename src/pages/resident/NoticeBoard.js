import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NoticeBoard.css';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Use the public endpoint with auth token
      const response = await axios.get('/api/admin/notices/public/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotices(response.data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (noticeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/notices/${noticeId}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Update local state to show notice as read
      setNotices(notices.map(notice => 
        notice.id === noticeId ? { ...notice, isRead: true } : notice
      ));
    } catch (error) {
      console.error('Error marking notice as read:', error);
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Society Notices</h2>
        <p className="text-slate-500">Stay updated with important announcements from the management</p>
      </div>

      {/* Notices Container */}
      <div className="notices-container">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner-modern"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="empty-state text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📋
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Notices Available</h3>
            <p className="text-slate-500">There are no notices posted by the society management at the moment.</p>
          </div>
        ) : (
          <div className="notices-list space-y-6">
            {notices.map((notice, index) => (
              <div 
                key={notice.id} 
                className={`modern-card p-6 animate-slide-up ${notice.isRead ? 'opacity-75' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Notice Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{notice.title}</h3>
                      {!notice.isRead && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                      {notice.isRead && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-full">
                          Read
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {formatDate(notice.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatTime(notice.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notice Content */}
                <div className="notice-content mb-6">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {notice.message}
                  </div>
                </div>
                
                {/* Notice Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 17H2a3 3 0 003-3h14a3 3 0 013 3z" />
                      <path d="M22 12H2a3 3 0 003-3h14a3 3 0 013 3z" />
                      <path d="M22 7H2a3 3 0 003-3h14a3 3 0 013 3z" />
                    </svg>
                    Official Notice from Management
                  </div>
                  
                  {/* Mark as Read Button */}
                  {!notice.isRead ? (
                    <button
                      onClick={() => markAsRead(notice.id)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Mark as Read
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Read
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
