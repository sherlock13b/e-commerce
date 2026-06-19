import React from 'react';
import { FilterToolbarProps, SortOption } from '../types/index';

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  categories,
  selectedCategory,
  activeSort,
  onCategoryChange,
  onSortChange
}) => {
  return (
    <section className="controls-toolbar">
      <div className="filter-buttons-group">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category === 'all' ? 'All Products' : category}
          </button>
        ))}
      </div>

      <div className="sort-wrapper">
        <label htmlFor="price-sort">Sort by Price: </label>
        <select
          id="price-sort"
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="default">Default Sorter</option>
          <option value="low-to-high">Price: Low to High</option>
          <option value="high-to-low">Price: High to Low</option>
        </select>
      </div>
    </section>
  );
};