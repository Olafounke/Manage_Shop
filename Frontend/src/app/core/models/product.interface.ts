export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  categories?: string[];
  owner: string;
  stores: string[];
  customFields?: Record<string, any>;
  totalInventory?: number;
  inStock?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
