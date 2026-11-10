import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { RespuestaApi } from '../models/api';
import { Producto } from '../models/productos';
import { API_BASE_URL, apiImageUrl } from './api';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private readonly apiUrl = `${API_BASE_URL}/productos`;

  constructor(private readonly http: HttpClient) {}

  listar(buscar = ''): Observable<Producto[]> {
    let params = new HttpParams();
    if (buscar.trim()) {
      params = params.set('buscar', buscar.trim());
    }

    return this.http.get<Producto[]>(this.apiUrl, { params }).pipe(
      map(productos => productos.map(producto => this.normalizar(producto))),
    );
  }

  verUno(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`).pipe(
      map(producto => this.normalizar(producto)),
    );
  }

  crear(producto: Partial<Producto>): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(this.apiUrl, producto);
  }

  editar(id: number, producto: Partial<Producto>): Observable<RespuestaApi> {
    return this.http.put<RespuestaApi>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/${id}`);
  }

  subirImagen(archivo: File): Observable<{ imagen: string }> {
    const datos = new FormData();
    datos.append('imagen', archivo);
    return this.http.post<{ imagen: string }>(`${this.apiUrl}/imagen`, datos);
  }

  imagenUrl(imagen: string | null | undefined): string {
    return apiImageUrl(imagen);
  }

  private normalizar(producto: Producto): Producto {
    return {
      ...producto,
      precio: Number(producto.precio),
    };
  }
}
