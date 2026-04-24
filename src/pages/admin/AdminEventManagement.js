import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'FESTIVAL'
  });

  const eventTypes = [
    { value: 'FESTIVAL', label: '🎉 Festival', color: '#fbbf24' },
    { value: 'MEETING', label: '📅 Meeting', color: '#3b82f6' },
    { value: 'PARTY', label: '🎊 Party', color: '#8b5cf6' },
    { value: 'OTHER', label: '📦 Other', color: '#6b7280' }
  ];

  useEffect(() => {
    fetchEvents();
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchEvents();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStats = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/events/${eventId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEventStats(response.data);
    } catch (error) {
      console.error('Error fetching event stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/events', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'FESTIVAL'
      });
      setShowForm(false);
      fetchEvents();
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to create event: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEvents();
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event.');
    }
  };

  const viewEventStats = (event) => {
    setSelectedEvent(event);
    fetchEventStats(event.id);
  };

  const getTypeLabel = (type) => {
    return eventTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type) => {
    return eventTypes.find(t => t.value === type)?.color || '#6b7280';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const chartData = eventStats?.responses ? [
    { name: 'Going', count: eventStats.responses.going, color: '#10b981' },
    { name: 'Not Going', count: eventStats.responses.notGoing, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner-modern"></div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">🎉 Event Management</h2>
        <p className="text-slate-500 mt-1">Create and manage society events</p>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="btn-modern-primary"
        >
          ➕ Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No events created yet
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="modern-card hover:shadow-lg transition-shadow">
              {/* Event Image */}
              <div className="h-48 bg-slate-200 rounded-t-xl overflow-hidden">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=400'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=400';
                  }}
                />
              </div>
              
              {/* Event Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${getTypeColor(event.type)}20`, color: getTypeColor(event.type) }}
                  >
                    {getTypeLabel(event.type)}
                  </span>
                  <span className="text-sm text-slate-500">{formatDate(event.date)}</span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 mb-2">{event.title}</h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center text-sm text-slate-500 mb-4">
                  <span>📍 {event.location}</span>
                  {event.time && <span className="ml-4">🕐 {event.time}</span>}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => viewEventStats(event)}
                    className="btn-modern-secondary flex-1 text-sm"
                  >
                    📊 Stats
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="modern-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">➕ Create New Event</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input-modern w-full"
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-input-modern w-full"
                  required
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-input-modern w-full h-20 resize-none"
                  placeholder="Enter event description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="form-input-modern w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="form-input-modern w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="form-input-modern w-full"
                  placeholder="Enter event location"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-modern-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modern-primary flex-1"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Stats Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="modern-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">📊 Event Analytics: {selectedEvent.title}</h3>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setEventStats(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {eventStats ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-emerald-100 p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-emerald-600">{eventStats.responses.going}</p>
                      <p className="text-sm text-emerald-700">Going</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-red-600">{eventStats.responses.notGoing}</p>
                      <p className="text-sm text-red-700">Not Going</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-blue-600">{eventStats.responses.total}</p>
                      <p className="text-sm text-blue-700">Total</p>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <div className="spinner-modern"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventManagement;
