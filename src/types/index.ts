export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export type SortOption = 'default' | 'low-to-high' | 'high-to-low';

export interface FilterToolbarProps {
  categories: string[];
  selectedCategory: string;
  activeSort: SortOption;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: SortOption) => void;
}

export interface ProductCardProps {
  product: Product;
}