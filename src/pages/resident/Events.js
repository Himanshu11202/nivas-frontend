import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchEvents();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'upcoming' ? '/api/events/upcoming' : '/api/events/past';
      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const eventDate = new Date(dateStr);
    return today.toDateString() === eventDate.toDateString();
  };

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
        <h2 className="text-3xl font-bold text-slate-900">🎉 Society Events</h2>
        <p className="text-slate-500 mt-1">Discover and RSVP to upcoming events</p>
      </div>

      {/* Tabs */}
      <div className="modern-card p-1 mb-6 flex gap-1 w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📅 Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📜 Past Events
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🎊</div>
            <p className="text-slate-500 text-lg">No {activeTab} events</p>
            <p className="text-slate-400 text-sm mt-1">Check back later for new events!</p>
          </div>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              to={`/resident/events/${event.id}`}
              className="modern-card hover:shadow-lg transition-all group"
            >
              {/* Event Image */}
              <div className="h-48 bg-slate-200 rounded-t-xl overflow-hidden relative">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=400'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=400';
                  }}
                />
                {isToday(event.date) && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    TODAY
                  </div>
                )}
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
                  <span className="text-sm text-slate-500 font-medium">{formatDate(event.date)}</span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center text-sm text-slate-500">
                  <span>📍 {event.location}</span>
                  {event.time && <span className="ml-4">🕐 {event.time}</span>}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-blue-600 font-medium text-sm group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
