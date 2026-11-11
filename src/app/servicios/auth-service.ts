import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { RespuestaApi, RespuestaAutenticacion, Usuario } from '../models/api';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_BASE_URL}/usuarios`;
  private readonly usuarioActual = signal<Usuario | null>(this.leerUsuario());

  constructor(private readonly http: HttpClient) {}

  registro(datos: { nombre: string; email: string; contraseña: string }): Observable<RespuestaApi> {
    return this.http.post<RespuestaApi>(`${this.apiUrl}/registro`, datos);
  }

  login(email: string, contraseña: string): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/login`, {
      email,
      contraseña,
    }).pipe(
      tap(respuesta => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        this.usuarioActual.set(respuesta.usuario);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActual.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  estaLogueado(): boolean {
    return this.getToken() !== null && this.usuarioActual() !== null;
  }

  esAdmin(): boolean {
<<<<<<< HEAD
  
  return this.usuarioActual()?.rol === 'admin';
    
=======
    return this.usuarioActual()?.rol === 'admin';
>>>>>>> c1fe00a (modificacion de css)
  }

  nombreUsuario(): string {
    return this.usuarioActual()?.nombre ?? '';
  }

  private leerUsuario(): Usuario | null {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      return null;
    }

    try {
      const usuario: unknown = JSON.parse(usuarioGuardado);
      if (
        typeof usuario === 'object' &&
        usuario !== null &&
        'id_usuario' in usuario &&
        'nombre' in usuario &&
        'rol' in usuario &&
        typeof usuario.id_usuario === 'number' &&
        typeof usuario.nombre === 'string' &&
        (usuario.rol === 'admin' || usuario.rol === 'user')
      ) {
        return {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol,
        };
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      return null;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return null;
  }
}
