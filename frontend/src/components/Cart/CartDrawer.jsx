/**
 * Cart drawer component (slide-in panel).
 */
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import useCartStore from '../../hooks/useCart';
import CartItem from './CartItem';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose, tableId }) => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!tableId) {
      toast.error('Table number is required');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare checkout request
      const checkoutItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const response = await api.post('/api/checkout/create-session', {
        table_id: tableId,
        items: checkoutItems,
        customer_name: customerName || null,
        special_instructions: specialInstructions || null,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error.response?.data?.detail ||
          'Failed to create checkout session. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Checkout Form & Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Customer Info */}
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="instructions"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Special Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="No onions, extra sauce, etc."
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
