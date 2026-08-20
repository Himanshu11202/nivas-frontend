import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentApproval from './pages/admin/ResidentApproval';
import WorkerManagement from './pages/admin/WorkerManagement';
import GuardManagement from './pages/admin/GuardManagement';
import AttendanceDashboard from './pages/admin/AttendanceDashboard';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import NoticeBoard from './pages/admin/NoticeBoard';
import VisitorLogs from './pages/admin/VisitorLogs';
import MaintenanceManagement from './pages/admin/MaintenanceManagement';
import AllBills from './pages/admin/AllBills';
import AdminMarketplace from './pages/admin/AdminMarketplace';
import ExpenseManagement from './pages/admin/ExpenseManagement';
import AdminEventManagement from './pages/admin/AdminEventManagement';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import SocietyDetails from './pages/admin/SocietyDetails';
import MaintenanceCollectionDashboard from './pages/admin/MaintenanceCollectionDashboard';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentComplaintManagement from './pages/resident/ComplaintManagement';
import ResidentNoticeBoard from './pages/resident/NoticeBoard';
import VisitorApproval from './pages/resident/VisitorApproval';
import MyBills from './pages/resident/MyBills';
import ResidentMaintenance from './pages/resident/ResidentMaintenance';
import Marketplace from './pages/resident/Marketplace';
import AddProduct from './pages/resident/AddProduct';
import ProductDetail from './pages/resident/ProductDetail';
import MyListings from './pages/resident/MyListings';
import Events from './pages/resident/Events';
import EventDetail from './pages/resident/EventDetail';
import NotificationPage from './pages/NotificationPage';
import AttendanceManagement from './pages/guard/AttendanceManagement';
import VisitorManagement from './pages/guard/VisitorManagement';
import GuardDashboard from './pages/guard/GuardDashboard';
import NewGuardDashboard from './pages/guard/NewGuardDashboard';
import GuestPage from './pages/guard/GuestPage';
import DeliveryPage from './pages/guard/DeliveryPage';
import GuardWorkerAttendance from './pages/guard/GuardWorkerAttendance';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/admin" element={
                <ProtectedRoute roles={['ADMIN', 'SOCIETY_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={null} />
                <Route path="residents" element={<ResidentApproval />} />
                <Route path="workers" element={<WorkerManagement />} />
                <Route path="guards" element={<GuardManagement />} />
                <Route path="attendance" element={<AttendanceDashboard />} />
                <Route path="complaints" element={<ComplaintManagement />} />
                <Route path="notices" element={<NoticeBoard />} />
                <Route path="visitor-logs" element={<VisitorLogs />} />
                <Route path="maintenance" element={<MaintenanceManagement />} />
                <Route path="bills" element={<AllBills />} />
                <Route path="marketplace" element={<AdminMarketplace />} />
                <Route path="expenses" element={<ExpenseManagement />} />
                <Route path="events" element={<AdminEventManagement />} />
              </Route>

              <Route path="/super-admin" element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/society/:id" element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <SocietyDetails />
                </ProtectedRoute>
              } />
              <Route path="/super-admin/maintenance-collection" element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <MaintenanceCollectionDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/resident" element={
                <ProtectedRoute role="RESIDENT">
                  <ResidentDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/resident/dashboard" replace />} />
                <Route path="dashboard" element={<div style={{padding: '20px'}}><h2>Resident Dashboard</h2><p>Welcome to your resident dashboard.</p></div>} />
                <Route path="maintenance" element={<ResidentMaintenance />} />
                <Route path="my-bills" element={<MyBills />} />
                <Route path="complaints" element={<ResidentComplaintManagement />} />
                <Route path="notices" element={<ResidentNoticeBoard />} />
                <Route path="visitors" element={<VisitorApproval />} />
                <Route path="notifications" element={<NotificationPage />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/add" element={<AddProduct />} />
                <Route path="marketplace/product/:id" element={<ProductDetail />} />
                <Route path="marketplace/my-listings" element={<MyListings />} />
                <Route path="events" element={<Events />} />
                <Route path="events/:id" element={<EventDetail />} />
              </Route>
              
              <Route path="/guard" element={
                <ProtectedRoute role="GUARD">
                  <GuardDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/guard/dashboard" replace />} />
                <Route path="dashboard" element={<NewGuardDashboard />} />
                <Route path="guest" element={<GuestPage />} />
                <Route path="delivery" element={<DeliveryPage />} />
                <Route path="workers" element={<GuardWorkerAttendance />} />
                <Route path="visitors" element={<VisitorManagement />} />
                <Route path="attendance" element={<AttendanceManagement />} />
              </Route>
              
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
