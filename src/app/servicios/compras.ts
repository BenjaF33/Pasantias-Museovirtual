import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Compra, RespuestaCompra } from '../models/api';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly apiUrl = `${API_BASE_URL}/compras`;

  constructor(private readonly http: HttpClient) {}

  finalizar(): Observable<RespuestaCompra> {
    return this.http.post<RespuestaCompra>(`${this.apiUrl}/finalizar`, {});
  }

  historial(): Observable<Compra[]> {
    return this.http.get<Compra[]>(this.apiUrl);
  }

  todas(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.apiUrl}/todas`);
  }
}
