import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RespuestaTicket, Ticket } from '../models/api';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly apiUrl = `${API_BASE_URL}/tickets`;
  readonly baseArchivos = `${API_BASE_URL}/`;

  constructor(private readonly http: HttpClient) {}

  generar(idCompra: number): Observable<RespuestaTicket> {
    return this.http.post<RespuestaTicket>(`${this.apiUrl}/generar/${idCompra}`, {});
  }

  ver(idCompra: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${idCompra}`);
  }
}
