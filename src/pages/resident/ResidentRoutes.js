import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VisitorApproval from './VisitorApproval';
import ComplaintManagement from './ComplaintManagement';
import NoticeBoard from './NoticeBoard';
import NotificationPage from '../NotificationPage';

const ResidentRoutes = () => {
  return (
    <Routes>
      <Route path="/visitors" element={<VisitorApproval />} />
      <Route path="/complaints" element={<ComplaintManagement />} />
      <Route path="/notices" element={<NoticeBoard />} />
      <Route path="/notifications" element={<NotificationPage />} />
    </Routes>
  );
};

export default ResidentRoutes;
