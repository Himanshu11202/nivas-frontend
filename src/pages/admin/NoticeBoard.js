import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NoticeBoard.css';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'NORMAL',
    category: 'GENERAL'
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showUnreadUsers, setShowUnreadUsers] = useState(false);
  const [noticeStats, setNoticeStats] = useState(null);
  const [unreadUsers, setUnreadUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get('/api/admin/notices');
      setNotices(response.data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const fetchNoticeStats = async (noticeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/notices/${noticeId}/stats`);
      setNoticeStats(response.data);
      setShowStats(true);
    } catch (error) {
      console.error('Error fetching notice stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadUsers = async (noticeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/notices/${noticeId}/unread-users`);
      setUnreadUsers(response.data || []);
      setShowUnreadUsers(true);
    } catch (error) {
      console.error('Error fetching unread users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/notices', formData);
      setFormData({ title: '', message: '', priority: 'NORMAL', category: 'GENERAL' });
      setShowForm(false);
      fetchNotices();
      alert('Notice posted successfully!');
    } catch (error) {
      console.error('Error posting notice:', error);
      alert('Error posting notice');
    }
  };

  const handleDelete = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await axios.delete(`/api/admin/notices/${noticeId}`);
        fetchNotices();
      } catch (error) {
        console.error('Error deleting notice:', error);
      }
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

  // Progress Bar Component
  const ProgressBar = ({ percentage, readCount, totalResidents }) => (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-slate-700">Read Progress</span>
        <span className="font-bold text-emerald-600">{percentage}% Read</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{readCount} residents read</span>
        <span>{totalResidents} total residents</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Notice Board</h2>
          <p className="text-slate-500 mt-1">Manage society notices and track read receipts</p>
        </div>
        <button 
          className="btn-modern-primary"
          onClick={() => setShowForm(true)}
        >
          + Post New Notice
        </button>
      </div>

      {/* Create Notice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="modern-card max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Post New Notice</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input-modern w-full"
                  placeholder="Enter notice title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="form-input-modern w-full"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="NORMAL">🔵 Normal</option>
                    <option value="HIGH">🟡 High</option>
                    <option value="URGENT">🔴 Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="form-input-modern w-full"
                  >
                    <option value="GENERAL">📢 General</option>
                    <option value="MAINTENANCE">🔧 Maintenance</option>
                    <option value="EVENT">🎉 Event</option>
                    <option value="EMERGENCY">🚨 Emergency</option>
                    <option value="BILL">💰 Bill</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="form-input-modern w-full"
                  placeholder="Enter notice message"
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-modern-primary flex-1">
                  Post Notice
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn-modern-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && noticeStats && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="modern-card max-w-md w-full">
            <div class="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Notice Analytics</h3>
              <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">{noticeStats.noticeTitle}</h4>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">{noticeStats.totalResidents}</p>
                  <p className="text-xs text-slate-600">Total Residents</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600">{noticeStats.readCount}</p>
                  <p className="text-xs text-slate-600">Read</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-600">{noticeStats.unreadCount}</p>
                  <p className="text-xs text-slate-600">Unread</p>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar 
                percentage={noticeStats.readPercentage}
                readCount={noticeStats.readCount}
                totalResidents={noticeStats.totalResidents}
              />

              {/* View Unread Users Button */}
              <button
                onClick={() => {
                  setShowStats(false);
                  fetchUnreadUsers(noticeStats.noticeId);
                }}
                className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
              >
                View Unread Users ({noticeStats.unreadCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unread Users Modal */}
      {showUnreadUsers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="modern-card max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Unread Users ({unreadUsers.length})</h3>
              <button onClick={() => setShowUnreadUsers(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            {unreadUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                All residents have read this notice! ✅
              </div>
            ) : (
              <div className="space-y-3">
                {unreadUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">Flat: {user.flatNumber || 'N/A'}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      Unread
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            📋
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No notices posted yet</h3>
          <p className="text-slate-500">Click "Post New Notice" to create the first notice.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notices.map((notice, index) => (
            <div key={notice.id} className="modern-card p-6 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{notice.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{formatDate(notice.createdAt)}</span>
                    <span>•</span>
                    <span>{formatTime(notice.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNoticeStats(notice.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Analytics"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3v18h18" />
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Notice"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="text-slate-700 leading-relaxed mb-4 line-clamp-3">
                {notice.message}
              </div>

              {/* Analytics Preview */}
              <button
                onClick={() => fetchNoticeStats(notice.id)}
                className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                📊 View Analytics
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
