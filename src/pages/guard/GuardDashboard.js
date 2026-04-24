import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import GuardSidebar from '../../components/guard/GuardSidebar';
import GuardHeader from '../../components/guard/GuardHeader';
import './GuardDashboard.css';

const GuardDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [todayVisitors, setTodayVisitors] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/guard/visitor-management/today');
      const data = response.data;
      
      const pending = data.filter(visitor => 
        visitor.status === 'APPROVED' || visitor.status === 'PENDING'
      );
      
      setVisitors(data);
      setTodayVisitors(data);
      setPendingVisitors(pending);
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

  const handleRecordEntry = async (visitorId) => {
    try {
      await axios.post(`/api/guard/visitors/${visitorId}/entry`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error recording entry:', error);
    }
  };

  const handleRecordExit = async (visitorId) => {
    try {
      await axios.post(`/api/guard/visitors/${visitorId}/exit`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error recording exit:', error);
    }
  };

  const handleSendEmergencyAlert = async () => {
    const message = prompt('Enter emergency message:');
    if (message) {
      try {
        await axios.post('/api/guard/emergency', { message });
        alert('Emergency alert sent successfully!');
      } catch (error) {
        console.error('Error sending emergency alert:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <GuardSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isActivePath={isActivePath}
      />
      
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <GuardHeader
          user={user}
          handleLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onEmergencyAlert={handleSendEmergencyAlert}
        />
        
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GuardDashboard;
