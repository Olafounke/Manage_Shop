import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItem {
  product: string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  owner: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/carts`;

  constructor(private http: HttpClient) {}

  // Récupérer le panier de l'utilisateur
  getUserCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  // Ajouter un produit au panier
  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(this.apiUrl, request);
  }

  // Mettre à jour la quantité d'un produit dans le panier
  updateCartItem(
    productId: string,
    request: UpdateCartItemRequest
  ): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/${productId}`, request);
  }

  // Supprimer un produit du panier
  removeFromCart(productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/${productId}`);
  }

  // Vider le panier
  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(this.apiUrl);
  }
}
