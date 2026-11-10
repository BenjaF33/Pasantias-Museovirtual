import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { RespuestaApi } from '../models/api';
import { Hecho } from '../models/hechos';
import { API_BASE_URL, apiImageUrl } from './api';

interface FavoritoApi {
  id_evento: number;
  titulo?: string;
  nombre?: string;
  anio: string | number;
  imagen_1?: string | null;
  imagen_2?: string | null;
  imagen_3?: string | null;
  descripcion?: string;
  descripcion_corta?: string;
  descripcion_larga?: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly apiUrl = `${API_BASE_URL}/favoritos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Hecho[]> {
    return this.http.get<FavoritoApi[]>(this.apiUrl).pipe(
      map(favoritos => favoritos.map(favorito => this.normalizar(favorito))),
    );
  }

  agregar(idEvento: number): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.apiUrl}/agregar`, { id_evento: idEvento });
  }

  eliminar(idEvento: number): Observable<RespuestaApi> {
    return this.http.delete<RespuestaApi>(`${this.apiUrl}/eliminar/${idEvento}`);
  }

  private normalizar(favorito: FavoritoApi): Hecho {
    const imagenes = [favorito.imagen_1, favorito.imagen_2, favorito.imagen_3]
      .filter((imagen): imagen is string => Boolean(imagen))
      .map(imagen => apiImageUrl(imagen));

    return {
      id_evento: Number(favorito.id_evento),
      anio: String(favorito.anio),
      img: imagenes,
      titulo: favorito.titulo ?? favorito.nombre ?? '',
      descripcion: favorito.descripcion ?? favorito.descripcion_corta ?? '',
      descripcion_larga: favorito.descripcion_larga ?? '',
    };
  }
}
