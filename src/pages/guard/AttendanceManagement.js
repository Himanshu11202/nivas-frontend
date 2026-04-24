import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  // Real-time polling setup
  useEffect(() => {
    fetchAllData();
    
    // Set up polling every 5 seconds for real-time updates
    intervalRef.current = setInterval(() => {
      fetchAllData(false); // silent refresh
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchAllData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      await Promise.all([
        fetchWorkers(),
        fetchTodayAttendance(),
        fetchAttendanceStats()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching workers with token:', token ? 'Token present' : 'No token');
      // Call API with status=ACTIVE query parameter
      const response = await axios.get('/api/workers?status=ACTIVE', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Workers fetched successfully:', response.data);
      setWorkers(response.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      console.error('Error response:', error.response?.data);
      // Try fallback endpoint without query param and filter manually
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/workers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Workers fetched (fallback):', response.data);
        const activeWorkers = (response.data || []).filter(w => w.status === 'ACTIVE');
        setWorkers(activeWorkers);
      } catch (error2) {
        console.error('Error fetching workers from fallback:', error2);
        setWorkers([]);
      }
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching today attendance with token:', token ? 'Token present' : 'No token');
      const response = await axios.get('/api/attendance/guard/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Today attendance fetched:', response.data);
      setTodayAttendance(response.data || []);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      console.error('Error response:', error.response?.data);
      setTodayAttendance([]);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance/guard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAttendanceStats(response.data || {});
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      setAttendanceStats({ presentToday: 0, absentToday: 0 });
    }
  };

  const handleCheckIn = async (workerId) => {
    // Check if already checked in today
    const alreadyCheckedIn = todayAttendance.some(att => 
      att.workerId === parseInt(workerId) && 
      att.checkInTime && 
      !att.checkOutTime
    );

    if (alreadyCheckedIn) {
      alert('Worker already checked in today!');
      return;
    }

    setActionLoading(prev => ({ ...prev, [workerId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/attendance/guard/checkin', {
        workerId: workerId,
        checkInTime: new Date().toISOString()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Check-in marked successfully!');
      fetchTodayAttendance();
      fetchAttendanceStats();
    } catch (error) {
      console.error('Error marking check-in:', error);
      alert('Error marking check-in. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [workerId]: false }));
    }
  };

  const handleCheckOut = async (workerId) => {
    // Check if checked in but not checked out
    const attendance = todayAttendance.find(att => 
      att.workerId === parseInt(workerId) && 
      att.checkInTime && 
      !att.checkOutTime
    );

    if (!attendance) {
      alert('Worker must be checked in first!');
      return;
    }

    setActionLoading(prev => ({ ...prev, [workerId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/attendance/guard/checkout', {
        workerId: workerId,
        checkOutTime: new Date().toISOString()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Check-out marked successfully!');
      fetchTodayAttendance();
      fetchAttendanceStats();
    } catch (error) {
      console.error('Error marking check-out:', error);
      alert('Error marking check-out. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [workerId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      ON_LEAVE: 'bg-yellow-100 text-yellow-800'
    };
    return `worker-status ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const isWorkerCheckedIn = (workerId) => {
    return todayAttendance.some(att => 
      att.workerId === parseInt(workerId) && 
      att.checkInTime && 
      !att.checkOutTime
    );
  };

  const getWorkerAttendance = (workerId) => {
    return todayAttendance.find(att => att.workerId === parseInt(workerId));
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="attendance-management">
      <div className="page-header">
        <h2>Worker Attendance</h2>
        <div className="stats-summary">
          <span className="stat present">Present: {attendanceStats.presentToday || 0}</span>
          <span className="stat absent">Absent: {attendanceStats.absentToday || 0}</span>
        </div>
      </div>

      <div className="attendance-content">
        <div className="worker-list-card">
          <h3>Workers List</h3>
          {workers.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6M23 11h-6"></path>
              </svg>
              <h4>No Workers Found</h4>
              <p>Please add workers from admin panel first</p>
            </div>
          ) : (
            <div className="workers-grid">
              {workers.map((worker) => {
                const isCheckedIn = isWorkerCheckedIn(worker.id);
                const attendance = getWorkerAttendance(worker.id);
                
                return (
                  <div key={worker.id} className="worker-card">
                    <div className="worker-info">
                      <div className="worker-avatar">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="worker-details">
                        <h4>{worker.name}</h4>
                        <p className="worker-role">{worker.jobRole}</p>
                        <span className={getStatusBadge(worker.status)}>
                          {worker.status}
                        </span>
                      </div>
                    </div>
                    
                    {attendance && (
                      <div className="attendance-info">
                        <div className="time-info">
                          <span className="time-label">In:</span>
                          <span className="time-value">{formatTime(attendance.checkInTime)}</span>
                        </div>
                        {attendance.checkOutTime && (
                          <div className="time-info">
                            <span className="time-label">Out:</span>
                            <span className="time-value">{formatTime(attendance.checkOutTime)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="worker-actions">
                      {!isCheckedIn ? (
                        <button
                          onClick={() => handleCheckIn(worker.id)}
                          disabled={actionLoading[worker.id] || worker.status !== 'ACTIVE'}
                          className="btn-check-in"
                        >
                          {actionLoading[worker.id] ? '...' : 'Check In'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckOut(worker.id)}
                          disabled={actionLoading[worker.id]}
                          className="btn-check-out"
                        >
                          {actionLoading[worker.id] ? '...' : 'Check Out'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="attendance-list-card">
          <h3>Today's Attendance</h3>
          {todayAttendance.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h4>No Attendance Records</h4>
              <p>Worker attendance will appear here once marked</p>
            </div>
          ) : (
            <div className="attendance-table">
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Role</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.map((attendance) => {
                    const worker = workers.find(w => w.id === attendance.workerId);
                    return (
                      <tr key={attendance.id}>
                        <td className="worker-name">{worker ? worker.name : 'Unknown'}</td>
                        <td>{worker ? worker.jobRole : 'N/A'}</td>
                        <td>{formatTime(attendance.checkInTime)}</td>
                        <td>{formatTime(attendance.checkOutTime)}</td>
                        <td>
                          <span className={`status-badge ${attendance.checkOutTime ? 'completed' : 'active'}`}>
                            {attendance.checkOutTime ? 'Completed' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
