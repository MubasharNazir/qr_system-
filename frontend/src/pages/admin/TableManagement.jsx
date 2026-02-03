/**
 * Table management page - Add, edit, delete tables.
 */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Failed to load tables:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load tables';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId, tableNumber) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)) return;
    
    try {
      await api.delete(`/api/admin/tables/${tableId}`);
      toast.success('Table deleted');
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete table');
    }
  };

  const handleToggleActive = async (table) => {
    try {
      await api.put(
        `/api/admin/tables/${table.id}`,
        { is_active: !table.is_active }
      );
      toast.success(`Table ${table.table_number} ${!table.is_active ? 'activated' : 'deactivated'}`);
      fetchTables();
    } catch (error) {
      toast.error('Failed to update table');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading tables...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
        <button
          onClick={() => {
            setEditingTable(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Table
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Total Tables:</strong> {tables.length} | 
          <strong> Active:</strong> {tables.filter(t => t.is_active).length} | 
          <strong> Inactive:</strong> {tables.filter(t => !t.is_active).length}
        </p>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No tables yet. Add your first table!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`bg-white rounded-lg shadow p-6 ${
                !table.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Table {table.table_number}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    table.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {table.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleToggleActive(table)}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    table.is_active
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {table.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    setEditingTable(table);
                    setShowForm(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table.id, table.table_number)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Form Modal */}
      {showForm && (
        <TableForm
          table={editingTable}
          existingTables={tables}
          onClose={() => {
            setShowForm(false);
            setEditingTable(null);
          }}
          onSuccess={fetchTables}
        />
      )}
    </div>
  );
};

// Table Form Component
const TableForm = ({ table, existingTables, onClose, onSuccess }) => {
  const [tableNumber, setTableNumber] = useState(table?.table_number || '');
  const [isActive, setIsActive] = useState(table?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tableNumber || tableNumber < 1) {
      toast.error('Table number must be at least 1');
      return;
    }

    // Check if table number already exists (only for new tables)
    if (!table && existingTables.some(t => t.table_number === parseInt(tableNumber))) {
      toast.error(`Table ${tableNumber} already exists`);
      return;
    }

    setLoading(true);

    try {
      if (table) {
        await api.put(
          `/api/admin/tables/${table.id}`,
          { is_active: isActive, qr_code_url: null }
        );
        toast.success('Table updated');
      } else {
        await api.post(
          '/api/admin/tables',
          { 
            table_number: parseInt(tableNumber), 
            is_active: isActive 
          }
        );
        toast.success('Table created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save table:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save table';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold mb-4">{table ? 'Edit' : 'Add'} Table</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Number
            </label>
            <input
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              disabled={!!table} // Can't change table number after creation
            />
            {table && (
              <p className="text-xs text-gray-500 mt-1">Table number cannot be changed</p>
            )}
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Inactive tables won't appear in customer menu
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableManagement;
