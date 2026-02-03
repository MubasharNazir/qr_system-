/**
 * Admin dashboard main page with corporate design.
 */
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
    { path: '/admin/menu', label: 'Menu', icon: '🍽️' },
    { path: '/admin/tables', label: 'Tables', icon: '🪑' },
    { path: '/admin/qr-codes', label: 'QR Codes', icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-xl`}>
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-white">Restaurant Admin</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage your restaurant operations</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
