/**
 * Category section component displaying items grouped by category.
 */
import React from 'react';
import MenuItem from './MenuItem';

const CategorySection = ({ category }) => {
  if (!category.items || category.items.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
