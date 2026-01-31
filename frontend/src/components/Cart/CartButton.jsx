/**
 * Floating cart button component.
 */
import React from 'react';
import useCartStore from '../../hooks/useCart';

const CartButton = ({ onClick }) => {
  const itemCount = useCartStore((state) => state.getItemCount());

  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors z-30 flex items-center gap-2"
      aria-label="Open cart"
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
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <span className="font-semibold">{itemCount}</span>
    </button>
  );
};

export default CartButton;
