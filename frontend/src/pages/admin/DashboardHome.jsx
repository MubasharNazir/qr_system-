/**
 * Admin dashboard home page.
 */
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/menu"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Management</h3>
          <p className="text-gray-600 text-sm">
            Add, edit, or remove menu items and categories
          </p>
        </Link>
        
        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
          <p className="text-gray-600 text-sm">
            See all customer orders and their status
          </p>
        </Link>
        
        <Link
          to="/admin/tables"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Table Management</h3>
          <p className="text-gray-600 text-sm">
            Add, edit, or remove restaurant tables
          </p>
        </Link>
        
        <Link
          to="/admin/qr-codes"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Codes</h3>
          <p className="text-gray-600 text-sm">
            Generate and download QR codes for tables
          </p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Link
            to="/admin/menu"
            className="block text-blue-600 hover:text-blue-700"
          >
            → Add new menu item
          </Link>
          <Link
            to="/admin/tables"
            className="block text-blue-600 hover:text-blue-700"
          >
            → Manage tables
          </Link>
          <Link
            to="/admin/qr-codes"
            className="block text-blue-600 hover:text-blue-700"
          >
            → Generate QR codes
          </Link>
          <Link
            to="/admin/orders"
            className="block text-blue-600 hover:text-blue-700"
          >
            → View recent orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
