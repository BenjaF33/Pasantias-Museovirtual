import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from './api';
import { ProductosService } from './productos';

describe('ProductosService', () => {
  let service: ProductosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads products and converts decimal prices to numbers', () => {
    service.listar().subscribe(productos => {
      expect(productos[0].precio).toBe(1500.5);
    });

    http.expectOne(`${API_BASE_URL}/productos`).flush([{
      id: 1,
      nombre: 'Libro',
      descripcion: 'Descripción',
      precio: '1500.50',
      imagen: 'libro.jpg',
    }]);
  });

  it('sends product filters as query parameters', () => {
    service.listar(' historia ').subscribe();

    const request = http.expectOne(`${API_BASE_URL}/productos?buscar=historia`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});
