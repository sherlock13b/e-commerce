import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, SortOption } from './types/index';
import { FilterToolbar } from './components/FilterToolbar';
import { ProductCard } from './components/ProductCard';
import './App.css';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('default');

  const categories = ['all', "electronics", "jewelery", "men's clothing", "women's clothing"];

  useEffect(() => {
    axios.get<Product[]>('https://fakestoreapi.com/products')
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let updatedList = [...products];

    if (selectedCategory !== 'all') {
      updatedList = updatedList.filter(
        (item) => item.category === selectedCategory
      );
    }

    if (activeSort === 'low-to-high') {
      updatedList.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'high-to-low') {
      updatedList.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updatedList);
  }, [selectedCategory, activeSort, products]);

  if (loading) {
    return <div className="loading-screen">Loading Store Items...</div>;
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Online Product Catalog</h1>
        <p>A simple product catalog fetching live data using React, TypeScript, and Axios</p>
      </header>

      <FilterToolbar
        categories={categories}
        selectedCategory={selectedCategory}
        activeSort={activeSort}
        onCategoryChange={setSelectedCategory}
        onSortChange={setActiveSort}
      />

      <main className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>
    </div>
  );
}

export default App;