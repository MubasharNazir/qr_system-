/**
 * Order confirmation page after successful payment.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';
import useCartStore from '../hooks/useCart';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order by session ID
        const response = await api.get(`/api/orders/by-session/${sessionId}`);
        setOrder(response.data);
        clearCart(); // Clear cart on successful order
        toast.success('Order placed successfully!');
      } catch (err) {
        console.error('Error fetching order:', err);
        // If order not found, it might still be processing
        if (err.response?.status === 404) {
          setError('Order not found. It may still be processing.');
        } else {
          setError('Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/menu')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>
        {order && (
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID:</p>
            <p className="font-mono text-sm mb-4">{order.id}</p>
            <p className="text-sm text-gray-600 mb-1">Total:</p>
            <p className="text-lg font-bold">{formatCurrency(order.total_amount)}</p>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-6">
          Your order will be prepared shortly. Please wait at your table.
        </p>
        <button
          onClick={() => {
            const tableParam = searchParams.get('table') || '';
            navigate(`/menu?table=${tableParam}`);
          }}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
