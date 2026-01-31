/**
 * Skeleton loader for menu items.
 */
import React from 'react';

const MenuSkeleton = () => {
  return (
    <div className="animate-pulse space-y-8">
      {[1, 2, 3].map((category) => (
        <div key={category} className="space-y-4">
          {/* Category header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          
          {/* Menu items skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuSkeleton;
