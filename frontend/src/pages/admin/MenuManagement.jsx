/**
 * Menu management page - Add, edit, delete menu items and categories.
 */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatCurrency';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, itemsRes] = await Promise.all([
        api.get('/api/admin/categories', { headers: getAuthHeaders() }),
        api.get('/api/admin/menu-items', { headers: getAuthHeaders() })
      ]);
      setCategories(catsRes.data);
      setMenuItems(itemsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/api/admin/menu-items/${id}`, { headers: getAuthHeaders() });
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure? This will delete all items in this category!')) return;
    
    try {
      await api.delete(`/api/admin/categories/${id}`, { headers: getAuthHeaders() });
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryForm(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Add Category
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowItemForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Add Menu Item
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                  <p className="text-sm text-gray-500">Order: {cat.display_order}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Menu Items</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item) => {
                const category = categories.find(c => c.id === item.category_id);
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowItemForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Form Modal */}
      {showItemForm && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

// Menu Item Form Component
const MenuItemForm = ({ item, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category_id: item?.category_id || categories[0]?.id || '',
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    image_url: item?.image_url || '',
    is_available: item?.is_available ?? true,
  });
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        await api.put(`/api/admin/menu-items/${item.id}`, formData, { headers: getAuthHeaders() });
        toast.success('Item updated');
      } else {
        await api.post('/api/admin/menu-items', formData, { headers: getAuthHeaders() });
        toast.success('Item created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">{item ? 'Edit' : 'Add'} Menu Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
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

// Category Form Component
const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    display_order: category?.display_order || 0,
  });
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category) {
        await api.put(`/api/admin/categories/${category.id}`, formData, { headers: getAuthHeaders() });
        toast.success('Category updated');
      } else {
        await api.post('/api/admin/categories', formData, { headers: getAuthHeaders() });
        toast.success('Category created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-bold mb-4">{category ? 'Edit' : 'Add'} Category</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
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

export default MenuManagement;
