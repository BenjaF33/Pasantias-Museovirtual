import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost/api_proyecto/public/usuarios';

  constructor(private readonly http: HttpClient) {}

  registro(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datos);
  }

  login(email: string, contraseña: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, contraseña }).pipe(
      tap((respuesta: any) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  estaLogueado(): boolean {
    return this.getToken() !== null;
  }

  esAdmin(): boolean {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.rol === 'admin';
  }
}