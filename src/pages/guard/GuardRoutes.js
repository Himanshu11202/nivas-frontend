import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VisitorManagement from './VisitorManagement';
import AttendanceManagement from './AttendanceManagement';

const GuardRoutes = () => {
  return (
    <Routes>
      <Route path="/visitors" element={<VisitorManagement />} />
      <Route path="/attendance" element={<AttendanceManagement />} />
    </Routes>
  );
};

export default GuardRoutes;
