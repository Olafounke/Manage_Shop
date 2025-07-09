import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Order,
  OrderGroup,
  CheckoutSession,
  PaymentStatus,
  UserAddress,
  UpdateOrderStatusRequest,
} from '../models/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getUserOrders(): Observable<OrderGroup[]> {
    return this.http.get<OrderGroup[]>(this.apiUrl);
  }

  getStoreOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}/order`);
  }

  getOrderGroupById(id: string): Observable<OrderGroup> {
    return this.http.get<OrderGroup>(`${this.apiUrl}/${id}/groupOrder`);
  }

  createCheckoutSession(userAddress: UserAddress): Observable<CheckoutSession> {
    return this.http.post<CheckoutSession>(`${this.apiUrl}/checkout`, {
      userAddress,
    });
  }

  verifyPayment(sessionId: string): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(
      `${this.apiUrl}/verify-payment/${sessionId}`
    );
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    const request: UpdateOrderStatusRequest = { status };
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, request);
  }
}
