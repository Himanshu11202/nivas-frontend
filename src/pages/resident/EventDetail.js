import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [responses, setResponses] = useState({ going: 0, notGoing: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Fetch event details
      const eventRes = await axios.get(`/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvent(eventRes.data);

      // Fetch user's response
      const responseRes = await axios.get(`/api/events/${id}/response`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserResponse(responseRes.data || null);

      // Fetch all responses
      const allResponsesRes = await axios.get(`/api/events/${id}/responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResponses(allResponsesRes.data || { going: 0, notGoing: 0, total: 0 });
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/events/${id}/rsvp`, { status }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEventDetails();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update response. Please try again.');
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'FESTIVAL': '🎉 Festival',
      'MEETING': '📅 Meeting',
      'PARTY': '🎊 Party',
      'OTHER': '📦 Other'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'FESTIVAL': '#fbbf24',
      'MEETING': '#3b82f6',
      'PARTY': '#8b5cf6',
      'OTHER': '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner-modern"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-4">The event you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/resident/events')} className="btn-modern-primary">
          ← Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/resident/events')}
        className="mb-6 text-slate-600 hover:text-slate-900 flex items-center gap-2"
      >
        ← Back to Events
      </button>

      {/* Event Header */}
      <div className="modern-card overflow-hidden">
        {/* Event Image */}
        <div className="h-64 md:h-80 bg-slate-200 relative">
          <img
            src={event.image || 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=800';
            }}
          />
          <div className="absolute top-4 left-4">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 backdrop-blur"
              style={{ color: getTypeColor(event.type) }}
            >
              {getTypeLabel(event.type)}
            </span>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{event.title}</h1>
          
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                📅
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium text-slate-900">{formatDate(event.date)}</p>
              </div>
            </div>
            
            {event.time && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  🕐
                </div>
                <div>
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="font-medium text-slate-900">{event.time}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                📍
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-medium text-slate-900">{event.location || 'TBD'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">About the Event</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {event.description || 'No description available.'}
            </p>
          </div>

          {/* RSVP Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Are you going?</h3>
            
            {/* RSVP Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => handleRSVP('GOING')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                  userResponse?.status === 'GOING'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                ✅ Going
              </button>
              <button
                onClick={() => handleRSVP('NOT_GOING')}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                  userResponse?.status === 'NOT_GOING'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                ❌ Not Going
              </button>
            </div>

            {/* Response Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-emerald-600">{responses.going}</p>
                <p className="text-sm text-slate-600">Going</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-red-600">{responses.notGoing}</p>
                <p className="text-sm text-slate-600">Not Going</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-600">{responses.total}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
