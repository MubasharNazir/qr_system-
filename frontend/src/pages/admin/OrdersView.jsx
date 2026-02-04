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
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const ringingIntervalRef = useRef(null);

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
      stopRinging();
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
            
            // Start continuous ringing for new pending orders
            if (newOrder.order_status === 'pending') {
              startRinging();
            }
            
            // Show toast notification
            toast.success(`New order from Table ${newOrder.table_number}!`, {
              duration: 5000,
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
          } else if (message.type === 'order_status_update') {
            const updatedOrder = message.data;
            
            // Stop ringing if order was accepted
            if (updatedOrder.order_status === 'accepted') {
              stopRinging();
              toast.success(`Order from Table ${updatedOrder.table_number} accepted!`, {
                duration: 3000,
              });
            } else if (updatedOrder.order_status === 'rejected') {
              stopRinging();
              toast.error(`Order from Table ${updatedOrder.table_number} rejected!`, {
                duration: 3000,
              });
            } else if (updatedOrder.order_status === 'completed') {
              toast.success(`Order from Table ${updatedOrder.table_number} completed!`, {
                duration: 3000,
              });
            }
            
            // Update order in the list
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === updatedOrder.order_id
                  ? { ...order, order_status: updatedOrder.order_status }
                  : order
              )
            );
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

  const startRinging = () => {
    // If already ringing, don't start again
    if (ringingIntervalRef.current) {
      return;
    }
    
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const playRing = () => {
        if (!audioContextRef.current || !ringingIntervalRef.current) {
          return;
        }
        
        // Create oscillator for ringing sound
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        // Ring tone frequency (phone-like ring)
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        // Set volume
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.5);
      };
      
      // Play first ring immediately
      playRing();
      
      // Repeat ringing every 1 second
      ringingIntervalRef.current = setInterval(() => {
        // Check if there are still pending orders
        setOrders((currentOrders) => {
          const stillPending = currentOrders.some(order => order.order_status === 'pending');
          if (!stillPending) {
            stopRinging();
            return currentOrders;
          }
          playRing();
          return currentOrders;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting ringing:', error);
    }
  };

  const stopRinging = () => {
    try {
      // Clear interval
      if (ringingIntervalRef.current) {
        clearInterval(ringingIntervalRef.current);
        ringingIntervalRef.current = null;
      }
      
      // Stop oscillator
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
        oscillatorRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping ringing:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/orders', { headers: getAuthHeaders() });
      const fetchedOrders = response.data;
      setOrders(fetchedOrders);
      
      // Start ringing if there are pending orders
      const hasPending = fetchedOrders.some(order => order.order_status === 'pending');
      if (hasPending) {
        startRinging();
      } else {
        stopRinging();
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await api.put(
        `/api/admin/orders/${orderId}/accept`,
        {},
        { headers: getAuthHeaders() }
      );
      
      // Update order status locally and check if ringing should stop
      setOrders((prevOrders) => {
        const updated = prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, order_status: 'accepted' }
            : order
        );
        
        // Stop ringing if no more pending orders
        const stillPending = updated.filter(
          order => order.order_status === 'pending'
        );
        if (stillPending.length === 0) {
          stopRinging();
        }
        
        return updated;
      });
      
      toast.success('Order accepted successfully!');
    } catch (error) {
      toast.error('Failed to accept order');
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const response = await api.put(
        `/api/admin/orders/${orderId}/reject`,
        {},
        { headers: getAuthHeaders() }
      );
      
      // Update order status locally and check if ringing should stop
      setOrders((prevOrders) => {
        const updated = prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, order_status: 'rejected' }
            : order
        );
        
        // Stop ringing if no more pending orders
        const stillPending = updated.filter(
          order => order.order_status === 'pending'
        );
        if (stillPending.length === 0) {
          stopRinging();
        }
        
        return updated;
      });
      
      toast.success('Order rejected');
    } catch (error) {
      toast.error('Failed to reject order');
      console.error('Error rejecting order:', error);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const response = await api.put(
        `/api/admin/orders/${orderId}/complete`,
        {},
        { headers: getAuthHeaders() }
      );
      
      // Update order status locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, order_status: 'completed' }
            : order
        )
      );
      
      toast.success('Order marked as completed!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete order');
      console.error('Error completing order:', error);
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

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 animate-pulse';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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
            <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">Monitor and manage all customer orders</p>
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
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Unpaid Bills</p>
            <p className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.payment_status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.order_status === 'completed').length}
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-base font-semibold text-gray-900 mb-2">No orders yet</p>
          <p className="text-sm text-gray-500">Orders will appear here when customers place them</p>
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
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, index) => {
                  const isUnpaid = order.payment_status === 'pending';
                  const isPendingOrder = order.order_status === 'pending';
                  
                  return (
                  <tr 
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index === 0 && isPendingOrder ? 'bg-blue-50 animate-pulse-once border-l-4 border-l-blue-500' : ''
                    } ${
                      isUnpaid ? 'bg-red-50 border-l-4 border-l-red-500' : ''
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
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status.toUpperCase()}
                        </span>
                        {isUnpaid && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white animate-pulse">
                            BILL UNPAID
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.order_status || 'pending')}`}>
                        {order.order_status ? order.order_status.toUpperCase() : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.order_status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {order.order_status === 'accepted' && (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-green-600 font-medium">Accepted</span>
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            Mark as Completed
                          </button>
                        </div>
                      )}
                      {order.order_status === 'rejected' && (
                        <span className="text-xs text-red-600 font-medium">Rejected</span>
                      )}
                      {order.order_status === 'completed' && (
                        <span className="text-xs text-blue-600 font-medium">Completed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
