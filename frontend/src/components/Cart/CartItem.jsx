/**
 * Cart item component for displaying items in cart drawer.
 */
import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import useCartStore from '../../hooks/useCart';

const CartItem = ({ item }) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleQuantityChange = (delta) => {
    const newQuantity = item.quantity + delta;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
        <p className="text-sm text-gray-600">
          {formatCurrency(item.price)} each
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(-1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-gray-900">
          {formatCurrency(item.price * item.quantity)}
        </p>
        <button
          onClick={handleRemove}
          className="text-xs text-red-600 hover:text-red-700 mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
