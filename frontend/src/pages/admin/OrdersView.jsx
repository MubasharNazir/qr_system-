/**
 * Orders view page for admin.
 */
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatCurrency';

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  useEffect(() => {
    fetchOrders();
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);


  const connectWebSocket = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.error('No admin token found');
      return;
    }

    // Get WebSocket URL from API base URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const wsEndpoint = `${wsUrl}/api/admin/orders/ws?token=${token}`;

    try {
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for order notifications');
        setIsConnected(true);
        // Send ping every 30 seconds to keep connection alive
        setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'new_order') {
            const newOrder = message.data;
            
            // Play notification sound
            playNotificationSound();
            
            // Show toast notification
            toast.success(`New order from Table ${newOrder.table_number}!`, {
              duration: 5000,
              icon: '🔔',
            });
            
            // Add new order to the beginning of the list
            setOrders((prevOrders) => {
              // Check if order already exists (avoid duplicates)
              const exists = prevOrders.some(order => order.id === newOrder.id);
              if (exists) {
                return prevOrders;
              }
              return [newOrder, ...prevOrders];
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      // Use Web Audio API to play a beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/orders', { headers: getAuthHeaders() });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage all customer orders</p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-green-700">Live</span>
            </div>
          )}
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.payment_status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.payment_status === 'paid').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.payment_status === 'failed').length}
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg font-semibold text-gray-900 mb-2">No orders yet</p>
          <p className="text-gray-500">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr 
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index === 0 ? 'bg-blue-50 animate-pulse-once border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 font-semibold">
                        {order.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Table {order.table_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {order.customer_name || <span className="text-gray-400">—</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
