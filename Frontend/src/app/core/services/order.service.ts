import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Order {
  _id: string;
  user: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PaymentStatus {
  success: boolean;
  orderId?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  // Récupérer les commandes de l'utilisateur
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Récupérer une commande par ID
  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  // Créer une session de checkout
  createCheckoutSession(): Observable<CheckoutSession> {
    return this.http.post<CheckoutSession>(`${this.apiUrl}/checkout`, {});
  }

  // Vérifier le statut d'un paiement
  verifyPayment(sessionId: string): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(
      `${this.apiUrl}/verify-payment/${sessionId}`
    );
  }

  // Mettre à jour le statut d'une commande
  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Annuler une commande
  cancelOrder(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
