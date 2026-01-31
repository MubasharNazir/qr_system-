/**
 * Main App component with routing.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MenuPage from './pages/MenuPage';
import OrderConfirmation from './pages/OrderConfirmation';
import ErrorPage from './pages/ErrorPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardHome from './pages/admin/DashboardHome';
import MenuManagement from './pages/admin/MenuManagement';
import OrdersView from './pages/admin/OrdersView';
import TableManagement from './pages/admin/TableManagement';
import QRCodeGenerator from './pages/admin/QRCodeGenerator';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/" element={<MenuPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrdersView />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="qr-codes" element={<QRCodeGenerator />} />
        </Route>
        
        <Route path="*" element={<ErrorPage message="Page not found" />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
