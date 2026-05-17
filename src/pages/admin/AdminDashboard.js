import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import './AdminDashboard.css';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalWorkers: 0,
    pendingResidents: 0,
    presentToday: 0,
    totalComplaints: 0,
    pendingComplaints: 0
  });
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user, logout } = useAuth();
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [workerStats, setWorkerStats] = useState({
    totalWorkers: 0,
    presentToday: 0,
    checkedOutToday: 0,
    attendanceRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    maintenanceCollection: [],
    userDistribution: []
  });
  const [showResidentsModal, setShowResidentsModal] = useState(false);
  const [residents, setResidents] = useState([]);

  // Real-time polling setup
  useEffect(() => {
    // Initial fetch
    fetchAllData();
    
    // Set up polling every 5 seconds for real-time updates
    intervalRef.current = setInterval(() => {
      fetchAllData(false); // false = silent refresh (no loading spinner)
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchAllData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchWorkerStats(),
        fetchRecentActivity(),
        fetchAnalyticsData(),
        fetchSociety()
      ]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load some data. Retrying...');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      // Fetch all data from individual APIs
      const [
        dashboardStats,
        complaintStats,
        maintenanceStats,
        visitorStats
      ] = await Promise.allSettled([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/complaints/stats'),
        axios.get('/api/maintenance/admin/stats'),
        axios.get('/api/visitors/stats').catch(() => ({ data: { totalVisitors: 0, todayVisitors: 0 } }))
      ]);

      // Extract data with fallback defaults
      const adminStats = dashboardStats.status === 'fulfilled' ? dashboardStats.value.data : {};
      const complaints = complaintStats.status === 'fulfilled' ? complaintStats.value.data : {};
      const maintenance = maintenanceStats.status === 'fulfilled' ? maintenanceStats.value.data : {};
      const visitors = visitorStats.status === 'fulfilled' ? visitorStats.value.data : {};

      setStats({
        // Residents
        totalResidents: adminStats.totalResidents || adminStats.activeResidents || 0,
        pendingResidents: adminStats.pendingResidents || 0,
        
        // Flats (using total residents as proxy, or from stats)
        totalFlats: adminStats.totalFlats || adminStats.activeResidents || 0,
        occupancyRate: adminStats.totalResidents > 0 
          ? Math.round((adminStats.activeResidents / adminStats.totalResidents) * 100) 
          : 0,
        pendingApprovals: adminStats.pendingResidents || 0,
        
        // Complaints
        totalComplaints: complaints.totalComplaints || 0,
        pendingComplaints: complaints.pendingComplaints || 0,
        
        // Maintenance
        maintenanceCollected: maintenance.totalCollected || maintenance.totalPaid || 0,
        collectionRate: maintenance.collectionRate || 
          (maintenance.totalExpected > 0 
            ? Math.round((maintenance.totalPaid / maintenance.totalExpected) * 100) 
            : 0),
        
        // Visitors
        todayVisitors: visitors.todayVisitors || 0,
        totalVisitors: visitors.totalVisitors || 0
      });

    } catch (error) {
      console.error('Dashboard: Error loading data:', error);
      throw error;
    }
  }, []);

  const fetchWorkerStats = async () => {
    try {
      const response = await axios.get('/api/worker-attendance/stats');
      if (response.data) {
        setWorkerStats(response.data);
      }
    } catch (error) {
      // Try alternative endpoint
      try {
        const workersRes = await axios.get('/api/admin/workers');
        const totalWorkers = workersRes.data?.length || 0;
        setWorkerStats({
          totalWorkers: totalWorkers,
          presentToday: 0,
          checkedOutToday: 0,
          attendanceRate: 0
        });
      } catch (e) {
        console.log('Worker stats API not available yet');
      }
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent data from multiple sources
      const [
        residentsRes,
        complaintsRes,
        maintenanceRes
      ] = await Promise.allSettled([
        axios.get('/api/admin/residents').catch(() => ({ data: [] })),
        axios.get('/api/admin/complaints').catch(() => ({ data: [] })),
        axios.get('/api/maintenance/admin/all').catch(() => ({ data: [] }))
      ]);

      const residents = residentsRes.status === 'fulfilled' ? residentsRes.value.data : [];
      setResidents(residents);
      const complaints = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data : [];
      const maintenance = maintenanceRes.status === 'fulfilled' ? maintenanceRes.value.data : [];

      // Create activity feed from recent data
      const activities = [];

      // Add recent resident registrations (last 7 days)
      const recentResidents = residents
        .filter(r => r.createdAt && new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      
      recentResidents.forEach(r => {
        activities.push({
          icon: 'user',
          title: `New Resident: ${r.name}`,
          time: formatTimeAgo(r.createdAt),
          color: 'blue',
          timestamp: new Date(r.createdAt)
        });
      });

      // Add recent complaints
      const recentComplaints = complaints
        .filter(c => c.createdAt && new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

      recentComplaints.forEach(c => {
        activities.push({
          icon: 'complaint',
          title: `New Complaint: ${c.title}`,
          time: formatTimeAgo(c.createdAt),
          color: 'rose',
          timestamp: new Date(c.createdAt)
        });
      });

      // Add recent maintenance payments
      const recentPayments = maintenance
        .filter(m => m.paidAt && new Date(m.paidAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
        .slice(0, 3);

      recentPayments.forEach(m => {
        activities.push({
          icon: 'money',
          title: `Payment Received: ₹${m.amount}`,
          time: formatTimeAgo(m.paidAt),
          color: 'emerald',
          timestamp: new Date(m.paidAt)
        });
      });

      // Sort all activities by timestamp and take top 5
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  const fetchAnalyticsData = useCallback(async () => {
    try {
      // Generate user growth data (last 7 days)
      const userGrowth = Array.from({ length: 7 }, (_, i) => ({
        day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        users: Math.floor(Math.random() * 50) + 100 + (i * 5),
      }));

      // Monthly maintenance collection
      const maintenanceCollection = [
        { month: 'Jan', amount: 45000 },
        { month: 'Feb', amount: 52000 },
        { month: 'Mar', amount: 48000 },
        { month: 'Apr', amount: 61000 },
        { month: 'May', amount: 55000 },
        { month: 'Jun', amount: 67000 },
      ];

      // User distribution
      const userDistribution = [
        { name: 'Residents', value: stats.totalResidents || 45, color: '#3B82F6' },
        { name: 'Guards', value: stats.totalWorkers || 8, color: '#10B981' },
        { name: 'Admins', value: 2, color: '#F59E0B' },
      ];

      setAnalyticsData({
        userGrowth,
        maintenanceCollection,
        userDistribution
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [stats.totalResidents, stats.totalWorkers]);

  const fetchSociety = async () => {
    try {
      if (user?.societyId) {
        const response = await axios.get(`/api/super-admin/societies/id/${user.societyId}`);
        setSociety(response.data);
      }
    } catch (error) {
      console.error('Error fetching society:', error);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteResident = async (residentId) => {
    if (window.confirm('Are you sure you want to delete this resident? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/residents/${residentId}`);
        alert('Resident deleted successfully');
        fetchRecentActivity();
        fetchDashboardStats();
      } catch (error) {
        console.error('Error deleting resident:', error);
        alert(error.response?.data?.error || 'Error deleting resident');
      }
    }
  };

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getGrowthRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isActivePath={isActivePath}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <AdminHeader
          user={user}
          handleLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="p-4 lg:p-8">
          {location.pathname === '/admin' && (
            <div className="animate-fade-in">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                    Admin Dashboard
                  </h1>
                  {society && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {society.name}
                    </span>
                  )}
                </div>
                <p className="text-slate-500">
                  Welcome back, {user?.name}! Here's your society overview.
                </p>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {/* Skeleton Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="modern-card p-6 animate-pulse">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded mb-2 w-20"></div>
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </div>
                    ))}
                  </div>
                  {/* Skeleton Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="modern-card p-6 animate-pulse h-80">
                        <div className="h-6 bg-slate-200 rounded mb-4 w-40"></div>
                        <div className="h-64 bg-slate-100 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <p className="text-lg mb-2">{error}</p>
                  <button 
                    onClick={() => fetchAllData()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Last Updated Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live updates enabled</span>
                    </div>
                    {lastUpdated && (
                      <div className="text-sm text-slate-400">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
                    {[
                      { 
                        icon: 'users', 
                        value: formatNumber(stats.totalResidents || 0), 
                        label: 'Total Residents', 
                        change: `+${getGrowthRate(stats.totalResidents, 0)}%`,
                        color: 'blue',
                        delay: '0s',
                        onClick: () => setShowResidentsModal(true)
                      },
                      { 
                        icon: 'building', 
                        value: formatNumber(stats.totalFlats || 0), 
                        label: 'Total Flats', 
                        change: `${stats.occupancyRate || 0}% occupied`,
                        color: 'purple',
                        delay: '0.1s'
                      },
                      { 
                        icon: 'clock', 
                        value: formatNumber(stats.pendingApprovals || 0), 
                        label: 'Pending Approvals', 
                        change: 'Action needed',
                        color: 'amber',
                        delay: '0.2s'
                      },
                      { 
                        icon: 'complaint', 
                        value: formatNumber(stats.pendingComplaints || 0), 
                        label: 'Pending Complaints', 
                        change: `${stats.totalComplaints || 0} total`,
                        color: 'rose',
                        delay: '0.3s'
                      },
                      { 
                        icon: 'money', 
                        value: `₹${formatNumber(stats.maintenanceCollected || 0)}`, 
                        label: 'Maintenance', 
                        change: `${stats.collectionRate || 0}% rate`,
                        color: 'emerald',
                        delay: '0.4s'
                      },
                      { 
                        icon: 'worker', 
                        value: formatNumber(workerStats.totalWorkers || 0), 
                        label: 'Total Workers', 
                        change: `${workerStats.presentToday || 0} present today`,
                        color: 'orange',
                        delay: '0.5s'
                      },
                      { 
                        icon: 'visitor', 
                        value: formatNumber(stats.todayVisitors || 0), 
                        label: "Today's Visitors", 
                        change: `${stats.totalVisitors || 0} this month`,
                        color: 'indigo',
                        delay: '0.6s'
                      },
                    ].map((stat, index) => (
                      <div 
                        key={index}
                        className={`modern-card p-6 animate-slide-up ${stat.onClick ? 'cursor-pointer hover:scale-105' : ''}`}
                        style={{ animationDelay: stat.delay }}
                        onClick={stat.onClick}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                          stat.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                          stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                          stat.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          <StatIcon name={stat.icon} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-500 mb-2">{stat.label}</div>
                        <div className={`text-xs font-medium ${
                          stat.change.includes('+') ? 'text-emerald-600' : 
                          stat.change.includes('Action') ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Analytics Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* User Growth Line Chart */}
                    <div className="modern-card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">User Growth (7 Days)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                            <YAxis stroke="#64748B" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="users" 
                              stroke="#3B82F6" 
                              strokeWidth={3}
                              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Maintenance Bar Chart */}
                    <div className="modern-card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance Collection</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.maintenanceCollection}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                            <YAxis stroke="#64748B" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                              formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                            />
                            <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* User Distribution Pie Chart */}
                    <div className="modern-card p-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">User Distribution</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.userDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analyticsData.userDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="modern-card p-6 animate-slide-up" style={{ animationDelay: '0.9s' }}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                        <button 
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          onClick={fetchRecentActivity}
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <p>No recent activity</p>
                            <p className="text-sm mt-1">New residents, complaints, and payments will appear here</p>
                          </div>
                        ) : (
                          recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                activity.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-rose-100 text-rose-600'
                              }`}>
                                <ActivityIcon name={activity.icon} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{activity.title}</p>
                                <p className="text-sm text-slate-500">{activity.time}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Wing Overview */}
                    <div className="modern-card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Wing Overview</h3>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                          Manage
                        </button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { wing: 'Wing A', occupied: 17, total: 20, percentage: 85 },
                          { wing: 'Wing B', occupied: 18, total: 20, percentage: 90 },
                          { wing: 'Wing C', occupied: 15, total: 20, percentage: 75 },
                          { wing: 'Wing D', occupied: 19, total: 20, percentage: 95 },
                        ].map((wing, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-16 font-medium text-slate-700">{wing.wing}</div>
                            <div className="flex-1">
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${wing.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-16 text-right text-sm text-slate-500">
                              {wing.occupied}/{wing.total}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <Outlet />
        </main>
      </div>

      {/* Residents Modal */}
      {showResidentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Residents</h2>
              <button
                onClick={() => setShowResidentsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {residents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No residents found</p>
              ) : (
                <div className="space-y-3">
                  {residents.map((resident) => (
                    <div key={resident.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{resident.name}</p>
                        <p className="text-sm text-gray-600">{resident.email}</p>
                        <p className="text-sm text-gray-500">Flat: {resident.flatNumber} | Status: {resident.status}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteResident(resident.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Icon helper components
const StatIcon = ({ name }) => {
  const icons = {
    users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    building: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    clock: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    complaint: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    money: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    visitor: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    worker: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  };
  return icons[name] || null;
};

const ActivityIcon = ({ name }) => {
  const icons = {
    user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    money: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    complaint: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  };
  return icons[name] || null;
};

export default AdminDashboard;
