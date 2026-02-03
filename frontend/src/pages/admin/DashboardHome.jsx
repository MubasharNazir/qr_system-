/**
 * Admin dashboard home page with corporate design.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalTables: 0,
    activeTables: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [ordersRes, tablesRes] = await Promise.all([
        api.get('/api/admin/orders?limit=1000', { headers }),
        api.get('/api/admin/tables', { headers }),
      ]);

      const orders = ordersRes.data || [];
      const tables = tablesRes.data || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.payment_status === 'pending').length,
        totalTables: tables.length,
        activeTables: tables.filter(t => t.is_active).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      link: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'from-yellow-500 to-yellow-600',
      link: '/admin/orders',
    },
    {
      title: 'Active Tables',
      value: stats.activeTables,
      icon: '🪑',
      color: 'from-green-500 to-green-600',
      link: '/admin/tables',
    },
    {
      title: 'Total Tables',
      value: stats.totalTables,
      icon: '📊',
      color: 'from-purple-500 to-purple-600',
      link: '/admin/tables',
    },
  ];

  const quickActions = [
    {
      title: 'Menu Management',
      description: 'Add, edit, or remove menu items and categories',
      icon: '🍽️',
      link: '/admin/menu',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      title: 'View Orders',
      description: 'See all customer orders and their status',
      icon: '📦',
      link: '/admin/orders',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
    },
    {
      title: 'Table Management',
      description: 'Add, edit, or remove restaurant tables',
      icon: '🪑',
      link: '/admin/tables',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      title: 'QR Codes',
      description: 'Generate and download QR codes for tables',
      icon: '📱',
      link: '/admin/qr-codes',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} border-2 rounded-xl p-6 hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{action.icon}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Welcome to Restaurant Admin</h3>
            <p className="text-blue-100">
              Manage your restaurant operations efficiently. Monitor orders, update menu, and manage tables all in one place.
            </p>
          </div>
          <div className="text-6xl opacity-20">🏪</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
