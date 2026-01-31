/**
 * Menu item card component.
 */
import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import useCartStore from '../../hooks/useCart';

const MenuItem = ({ item }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {item.image_url && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(item.price)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!item.is_available}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              item.is_available
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.is_available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
