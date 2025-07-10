import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryOperationRequest,
} from '../models/inventory.interface';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/stores`;

  constructor(private http: HttpClient) {}

  getInventoryByStore(storeId: string): Observable<InventoryItem[]> {
    console.log('getInventoryByStore', storeId);
    return this.http.get<InventoryItem[]>(
      `${this.apiUrl}/${storeId}/inventory`
    );
  }

  getInventoryItem(storeId: string, itemId: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(
      `${this.apiUrl}/${storeId}/inventory/${itemId}`
    );
  }

  createInventoryItem(
    storeId: string,
    request: CreateInventoryItemRequest
  ): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(
      `${this.apiUrl}/${storeId}/inventory`,
      request
    );
  }

  updateInventoryItem(
    storeId: string,
    itemId: string,
    request: UpdateInventoryItemRequest
  ): Observable<InventoryItem> {
    console.log('updateInventoryItem', request);
    console.log('storeId', storeId);
    console.log('itemId', itemId);
    return this.http.put<InventoryItem>(
      `${this.apiUrl}/${storeId}/inventory/${itemId}`,
      request
    );
  }

  deleteInventoryItem(
    storeId: string,
    itemId: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${storeId}/inventory/${itemId}`
    );
  }

  incrementInventoryItem(
    storeId: string,
    itemId: string,
    request: InventoryOperationRequest
  ): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(
      `${this.apiUrl}/${storeId}/inventory/${itemId}/increment`,
      request
    );
  }

  decrementInventoryItem(
    storeId: string,
    itemId: string,
    request: InventoryOperationRequest
  ): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(
      `${this.apiUrl}/${storeId}/inventory/${itemId}/decrement`,
      request
    );
  }
}
