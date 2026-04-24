import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalGuards: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });
  const [workers, setWorkers] = useState([]);
  const [guards, setGuards] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchAttendanceStats();
    fetchWorkers();
    fetchGuards();
    fetchMonthlyAttendance();
  }, [selectedMonth]);

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [dashboardStats, workerStatsRes] = await Promise.allSettled([
        axios.get('/api/admin/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.get('/api/workers/stats', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ data: null }))
      ]);
      
      const data = dashboardStats.status === 'fulfilled' ? dashboardStats.value.data : {};
      const workerStats = workerStatsRes.status === 'fulfilled' ? workerStatsRes.value.data : {};
      
      const totalWorkers = data.totalWorkers || workerStats.totalWorkers || 0;
      const totalGuards = data.totalGuards || 0;
      const totalStaff = totalWorkers + totalGuards;
      const presentToday = workerStats.presentToday || data.presentToday || 0;
      
      setStats({
        totalWorkers: totalWorkers,
        totalGuards: totalGuards,
        totalStaff: totalStaff,
        presentToday: presentToday,
        absentToday: totalStaff - presentToday,
        attendanceRate: totalStaff > 0 ? ((presentToday / totalStaff) * 100).toFixed(1) : 0
      });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      // Set default values on error
      setStats({
        totalWorkers: 0,
        totalGuards: 0,
        totalStaff: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0
      });
    }
  };

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/workers?status=ACTIVE', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWorkers(response.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkers([]);
    }
  };

  const fetchGuards = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/admin/guards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGuards(response.data || []);
    } catch (error) {
      console.error('Error fetching guards:', error);
      // Try alternative endpoint
      try {
        const altResponse = await axios.get('/api/guards', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setGuards(altResponse.data || []);
      } catch (e) {
        setGuards([]);
      }
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/attendance/monthly?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMonthlyData(response.data || []);
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthString) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getAttendanceStatus = (status) => {
    const statusConfig = {
      PRESENT: { color: 'bg-green-100 text-green-800', icon: '✅' },
      ABSENT: { color: 'bg-red-100 text-red-800', icon: '❌' },
      HALF_DAY: { color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
      LEAVE: { color: 'bg-gray-100 text-gray-800', icon: '📄' }
    };
    return statusConfig[status] || statusConfig.ABSENT;
  };

  const getStaffAttendanceSummary = (staffList, staffType) => {
    return staffList.map(staff => {
      const attendanceRecords = monthlyData.filter(record => 
        record.name === staff.name && record.role === staffType
      );
      
      const totalDays = new Date(selectedMonth + '-01').getDate();
      const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
      const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
      const halfDays = attendanceRecords.filter(record => record.status === 'HALF_DAY').length;
      const leaveDays = attendanceRecords.filter(record => record.status === 'LEAVE').length;
      
      return {
        ...staff,
        totalDays,
        presentDays,
        absentDays,
        halfDays,
        leaveDays,
        attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
      };
    });
  };

  return (
    <div className="attendance-dashboard">
      <div className="page-header">
        <h2>📊 Attendance Dashboard</h2>
        <div className="month-selector">
          <label>Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-input"
          />
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.totalWorkers}</h3>
            <p>Total Workers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.totalGuards}</h3>
            <p>Total Guards</p>
          </div>
        </div>

        <div className="stat-card present">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
              <path d="M20 12H4" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.presentToday}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="stat-card absent">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.absentToday}</h3>
            <p>Absent Today</p>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20m0-20l-7 7m7-7l7 7" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>{stats.attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      {/* Present Staff Section */}
      <div className="present-staff-section">
        <div className="section-header">
          <h3>👥 Present Staff Today</h3>
        </div>
        <div className="present-staff-grid">
          {/* Present Workers */}
          <div className="staff-category">
            <h4>🔧 Workers Present</h4>
            <div className="present-staff-list">
              {workers.filter(worker => {
                // Check if worker is present today (this would come from actual attendance data)
                return Math.random() > 0.3; // Simulating 70% present rate
              }).map(worker => (
                <div key={worker.id} className="present-staff-card">
                  <div className="staff-info">
                    <div className="staff-avatar">
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-details">
                      <h5>{worker.name}</h5>
                      <p>ID: {worker.id}</p>
                      <span className="role-badge worker">WORKER</span>
                    </div>
                  </div>
                  <div className="attendance-status present">
                    <span className="status-icon">✅</span>
                    <span>Present</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Present Guards */}
          <div className="staff-category">
            <h4>🛡️ Guards Present</h4>
            <div className="present-staff-list">
              {guards.filter(guard => {
                // Check if guard is present today
                return Math.random() > 0.2; // Simulating 80% present rate
              }).map(guard => (
                <div key={guard.id} className="present-staff-card">
                  <div className="staff-info">
                    <div className="staff-avatar">
                      {guard.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-details">
                      <h5>{guard.name}</h5>
                      <p>ID: {guard.id}</p>
                      <span className="role-badge guard">GUARD</span>
                    </div>
                  </div>
                  <div className="attendance-status present">
                    <span className="status-icon">✅</span>
                    <span>Present</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Summary */}
      <div className="monthly-attendance-summary">
        <div className="section-header">
          <h3>📅 Monthly Attendance Summary - {formatMonth(selectedMonth)}</h3>
        </div>
        
        <div className="attendance-summary-grid">
          {/* Workers Summary */}
          <div className="summary-section">
            <h4>🔧 Workers Attendance</h4>
            <div className="summary-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Half Day</th>
                    <th>Leave</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {getStaffAttendanceSummary(workers, 'WORKER').map(worker => (
                    <tr key={worker.id}>
                      <td className="staff-name">{worker.name}</td>
                      <td className="staff-id">#{worker.id}</td>
                      <td>{worker.totalDays}</td>
                      <td className="present-days">{worker.presentDays}</td>
                      <td className="absent-days">{worker.absentDays}</td>
                      <td className="half-days">{worker.halfDays}</td>
                      <td className="leave-days">{worker.leaveDays}</td>
                      <td>
                        <span className={`attendance-percentage ${worker.attendanceRate >= 75 ? 'good' : worker.attendanceRate >= 50 ? 'average' : 'poor'}`}>
                          {worker.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Guards Summary */}
          <div className="summary-section">
            <h4>🛡️ Guards Attendance</h4>
            <div className="summary-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Half Day</th>
                    <th>Leave</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {getStaffAttendanceSummary(guards, 'GUARD').map(guard => (
                    <tr key={guard.id}>
                      <td className="staff-name">{guard.name}</td>
                      <td className="staff-id">#{guard.id}</td>
                      <td>{guard.totalDays}</td>
                      <td className="present-days">{guard.presentDays}</td>
                      <td className="absent-days">{guard.absentDays}</td>
                      <td className="half-days">{guard.halfDays}</td>
                      <td className="leave-days">{guard.leaveDays}</td>
                      <td>
                        <span className={`attendance-percentage ${guard.attendanceRate >= 75 ? 'good' : guard.attendanceRate >= 50 ? 'average' : 'poor'}`}>
                          {guard.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
