/**
 * Admin dashboard main page.
 */
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await api.post('/api/admin/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      toast.success('Logged out');
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/menu"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors"
            >
              Menu Management
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors"
            >
              Orders
            </Link>
            <Link
              to="/admin/tables"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors"
            >
              Tables
            </Link>
            <Link
              to="/admin/qr-codes"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors"
            >
              QR Codes
            </Link>
          </div>
        </nav>

        {/* Content */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
