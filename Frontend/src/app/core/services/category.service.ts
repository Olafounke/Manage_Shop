import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../models/category.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategoryNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories/names`);
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, request);
  }

  updateCategory(
    categoryId: string,
    request: UpdateCategoryRequest
  ): Observable<Category> {
    return this.http.put<Category>(
      `${this.apiUrl}/categories/${categoryId}`,
      request
    );
  }

  deleteCategory(categoryId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/categories/${categoryId}`
    );
  }
}
