import React from 'react';
import { ProductCardProps } from '../types/index';

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <article className="product-card">
      <span className="category-badge">{product.category}</span>
      
      <div className="image-container">
        <img src={product.image} alt={product.title} />
      </div>

      <div className="card-details">
        <h3>{product.title}</h3>
        <p className="description-text">{product.description}</p>
        <div className="price-tag">${product.price.toFixed(2)}</div>
      </div>
    </article>
  );
};