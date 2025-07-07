import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreResponse,
} from '../models/store.interface';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/stores`;

  constructor(private http: HttpClient) {}

  getAllStores(): Observable<Store[]> {
    return this.http.get<Store[]>(this.apiUrl);
  }

  getStoreById(storeId: string): Observable<Store> {
    return this.http.get<Store>(`${this.apiUrl}/${storeId}/info`);
  }

  createStore(request: CreateStoreRequest): Observable<StoreResponse> {
    return this.http.post<StoreResponse>(`${this.apiUrl}/create`, request);
  }

  updateStore(storeId: string, request: UpdateStoreRequest): Observable<Store> {
    return this.http.put<Store>(`${this.apiUrl}/${storeId}`, request);
  }

  deleteStore(storeId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${storeId}`);
  }
}
