import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ItemCarrito, RespuestaApi } from '../models/api';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly apiUrl = `${API_BASE_URL}/carrito`;

  constructor(private readonly http: HttpClient) {}

  ver(): Observable<ItemCarrito[]> {
    return this.http.get<ItemCarrito[]>(this.apiUrl);
  }

  agregar(idProducto: number, cantidad: number): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.apiUrl}/agregar`, {
      id_producto: idProducto,
      cantidad,
    });
  }

  actualizar(idProducto: number, cantidad: number): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.apiUrl}/actualizar/${idProducto}`, { cantidad });
  }

  eliminar(idProducto: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/eliminar/${idProducto}`);
  }

  vaciar(): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/vaciar`);
  }
}
