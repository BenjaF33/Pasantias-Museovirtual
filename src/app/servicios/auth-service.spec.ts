import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RespuestaAutenticacion } from '../models/api';
import { API_BASE_URL } from './api';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores the token and user after a successful login', () => {
    service = TestBed.inject(AuthService);
    const respuesta: RespuestaAutenticacion = {
      token: 'jwt',
      usuario: { id_usuario: 3, nombre: 'Ana', rol: 'admin' },
    };

    service.login('ana@example.com', 'clave').subscribe();
    http.expectOne(`${API_BASE_URL}/usuarios/login`).flush(respuesta);

    expect(service.estaLogueado()).toBe(true);
    expect(service.esAdmin()).toBe(true);
    expect(service.nombreUsuario()).toBe('Ana');
    expect(service.getToken()).toBe('jwt');
  });

  it('restores a session when the saved user id is a numeric string', () => {
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('usuario', JSON.stringify({
      id_usuario: '3',
      nombre: 'Ana',
      rol: 'user',
    }));

    service = TestBed.inject(AuthService);

    expect(service.estaLogueado()).toBe(true);
    expect(service.nombreUsuario()).toBe('Ana');
    expect(service.getToken()).toBe('jwt');
  });

  it('clears session data on logout', () => {
    service = TestBed.inject(AuthService);
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('usuario', JSON.stringify({
      id_usuario: 3,
      nombre: 'Ana',
      rol: 'user',
    }));

    service.logout();

    expect(service.estaLogueado()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
