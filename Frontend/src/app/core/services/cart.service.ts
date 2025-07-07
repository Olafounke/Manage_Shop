import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../models/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/carts`;

  constructor(private http: HttpClient) {}

  getUserCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(this.apiUrl, request);
  }

  updateCartItem(
    productId: string,
    request: UpdateCartItemRequest
  ): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/${productId}`, request);
  }

  removeFromCart(productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/${productId}`);
  }

  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(this.apiUrl);
  }
}
