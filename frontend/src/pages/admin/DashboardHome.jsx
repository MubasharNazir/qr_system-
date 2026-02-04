/**
 * Admin dashboard home page with analytics and corporate design.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const DashboardHome = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({
    totalTables: 0,
    activeTables: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [analyticsRes, tablesRes] = await Promise.all([
        api.get('/api/admin/analytics', { headers }),
        api.get('/api/admin/tables', { headers }),
      ]);

      setAnalytics(analyticsRes.data);
      const tables = tablesRes.data || [];
      setStats({
        totalTables: tables.length,
        activeTables: tables.filter(t => t.is_active).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate max values for chart scaling
  const getMaxSales = () => {
    if (!analytics?.daily_sales) return 1;
    return Math.max(...analytics.daily_sales.map(d => d.sales), 1);
  };

  const getMaxOrders = () => {
    if (!analytics?.daily_orders) return 1;
    return Math.max(...analytics.daily_orders.map(d => d.orders), 1);
  };

  const quickActions = [
    {
      title: 'Menu Management',
      description: 'Add, edit, or remove menu items and categories',
      link: '/admin/menu',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      title: 'View Orders',
      description: 'See all customer orders and their status',
      link: '/admin/orders',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
    },
    {
      title: 'Table Management',
      description: 'Add, edit, or remove restaurant tables',
      link: '/admin/tables',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      title: 'QR Codes',
      description: 'Generate and download QR codes for tables',
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Analytics Cards */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Sales Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Sales Today</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.sales.today)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics.orders.today} orders</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Sales This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(analytics.sales.this_week)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics.orders.this_week} orders</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(analytics.sales.total)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics.orders.total} total orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics Cards */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Order Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Orders Today</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orders.today}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Orders This Week</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orders.this_week}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.average_order_value)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Daily Sales (Last 7 Days)</h3>
          <div className="space-y-4">
            {analytics.daily_sales.map((day, index) => {
              const maxSales = getMaxSales();
              const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 text-xs font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        {day.sales > 0 && (
                          <span className="text-xs font-semibold text-white">
                            {formatCurrency(day.sales)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Daily Orders (Last 7 Days)</h3>
          <div className="space-y-4">
            {analytics.daily_orders.map((day, index) => {
              const maxOrders = getMaxOrders();
              const percentage = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 text-xs font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        {day.orders > 0 && (
                          <span className="text-xs font-semibold text-white">
                            {day.orders} orders
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.orders_by_status || {}).map(([status, count]) => {
              const total = analytics.orders.total || 1;
              const percentage = (count / total) * 100;
              const statusColors = {
                pending: 'bg-yellow-500',
                accepted: 'bg-green-500',
                rejected: 'bg-red-500',
                completed: 'bg-blue-500',
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-gray-700 capitalize">
                    {status}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{count} orders</span>
                      <span className="text-xs font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${statusColors[status] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Orders by Payment Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.orders_by_payment_status || {}).map(([status, count]) => {
              const total = analytics.orders.total || 1;
              const percentage = (count / total) * 100;
              const statusColors = {
                paid: 'bg-green-500',
                pending: 'bg-yellow-500',
                failed: 'bg-red-500',
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-gray-700 capitalize">
                    {status}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{count} orders</span>
                      <span className="text-xs font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${statusColors[status] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} border-2 rounded-lg p-4 hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
