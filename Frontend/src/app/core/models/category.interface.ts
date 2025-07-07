export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  category?: Category;
}
