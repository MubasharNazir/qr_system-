/**
 * Header component showing table number.
 */
import React from 'react';

const Header = ({ tableNumber }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Menu</h1>
            {tableNumber && (
              <p className="text-sm text-gray-600 mt-1">
                Table {tableNumber}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
