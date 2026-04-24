import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ResidentApproval from './ResidentApproval';
import WorkerManagement from './WorkerManagement';
import GuardManagement from './GuardManagement';
import AttendanceDashboard from './AttendanceDashboard';
import ComplaintManagement from './ComplaintManagement';
import NoticeBoard from './NoticeBoard';
import VisitorLogs from './VisitorLogs';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/residents" element={<ResidentApproval />} />
      <Route path="/workers" element={<WorkerManagement />} />
      <Route path="/guards" element={<GuardManagement />} />
      <Route path="/attendance" element={<AttendanceDashboard />} />
      <Route path="/complaints" element={<ComplaintManagement />} />
      <Route path="/notices" element={<NoticeBoard />} />
      <Route path="/visitor-logs" element={<VisitorLogs />} />
    </Routes>
  );
};

export default AdminRoutes;
