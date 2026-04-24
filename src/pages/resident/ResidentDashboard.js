import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import ResidentSidebar from '../../components/resident/ResidentSidebar';
import ResidentHeader from '../../components/resident/ResidentHeader';
import './ResidentDashboard.css';

const ResidentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is approved
    if (user?.status === 'PENDING') {
      return; // Don't fetch data if pending approval
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (user?.status === 'PENDING') {
      return; // Don't fetch if pending
    }
    
    try {
      const [complaintsResponse, visitorsResponse] = await Promise.all([
        axios.get(`/api/complaints/user/${user?.id}`),
        axios.get(`/api/resident/visitors/my-flat?flatNumber=${user?.flatNumber}`)
      ]);

      setComplaints(complaintsResponse.data);
      setVisitors(visitorsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ResidentSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isActivePath={isActivePath}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <ResidentHeader
          user={user}
          handleLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="p-4 lg:p-8">
          {user?.status === 'PENDING' ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="modern-card p-8 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Waiting for Approval</h2>
                <p className="text-slate-500 mb-6">Your resident account is pending approval by the society administrator.</p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-medium text-slate-900">{user?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Flat:</span>
                    <span className="font-medium text-slate-900">{user?.flatNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-900">{user?.email}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn-modern-secondary w-full"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : location.pathname === '/resident/dashboard' ? (
            <div className="animate-fade-in">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                  Welcome, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-slate-500">Manage your flat and society services</p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Flat {user?.flatNumber}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {[
                  { 
                    icon: 'complaint', 
                    value: complaints.filter(c => c.status === 'PENDING').length, 
                    label: 'Pending Complaints', 
                    color: 'rose',
                    delay: '0s'
                  },
                  { 
                    icon: 'visitor', 
                    value: visitors.filter(v => v.status === 'PENDING').length, 
                    label: 'Pending Visitors', 
                    color: 'amber',
                    delay: '0.1s'
                  },
                  { 
                    icon: 'notice', 
                    value: 5, 
                    label: 'Recent Notices', 
                    color: 'cyan',
                    delay: '0.2s'
                  },
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="modern-card p-6 animate-slide-up"
                    style={{ animationDelay: stat.delay }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      stat.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                      stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                      'bg-cyan-100 text-cyan-600'
                    }`}>
                      <ResidentStatIcon name={stat.icon} />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="modern-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { 
                      icon: 'complaint', 
                      label: 'File Complaint', 
                      desc: 'Report an issue',
                      path: '/resident/complaints',
                      color: 'rose'
                    },
                    { 
                      icon: 'visitor', 
                      label: 'Manage Visitors', 
                      desc: 'Pre-approve guests',
                      path: '/resident/visitors',
                      color: 'amber'
                    },
                    { 
                      icon: 'notice', 
                      label: 'View Notices', 
                      desc: 'Society updates',
                      path: '/resident/notices',
                      color: 'cyan'
                    },
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        action.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                        action.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                        'bg-cyan-100 text-cyan-600'
                      }`}>
                        <ResidentActionIcon name={action.icon} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 group-hover:text-cyan-600 transition-colors">{action.label}</p>
                        <p className="text-sm text-slate-500">{action.desc}</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

// Icon helper components
const ResidentStatIcon = ({ name }) => {
  const icons = {
    complaint: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    visitor: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    notice: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  };
  return icons[name] || null;
};

const ResidentActionIcon = ({ name }) => {
  const icons = {
    complaint: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    visitor: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    notice: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  };
  return icons[name] || null;
};

export default ResidentDashboard;
