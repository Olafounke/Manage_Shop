import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Transfert,
  CreateTransfertRequest,
} from '../models/transfert.interface';

@Injectable({
  providedIn: 'root',
})
export class TransfertService {
  private apiUrl = `${environment.apiUrl}/transferts`;

  constructor(private http: HttpClient) {}

  createTransfert(request: CreateTransfertRequest): Observable<Transfert> {
    return this.http.post<Transfert>(this.apiUrl, request);
  }

  getTransfertsByStore(
    storeId: string,
    type?: string
  ): Observable<Transfert[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Transfert[]>(`${this.apiUrl}/store/${storeId}`, {
      params,
    });
  }

  acceptTransfert(transfertId: string): Observable<Transfert> {
    return this.http.put<Transfert>(`${this.apiUrl}/${transfertId}/accept`, {});
  }

  rejectTransfert(transfertId: string): Observable<Transfert> {
    return this.http.put<Transfert>(`${this.apiUrl}/${transfertId}/reject`, {});
  }
}
