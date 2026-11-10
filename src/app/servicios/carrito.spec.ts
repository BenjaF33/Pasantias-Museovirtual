import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ItemCarrito } from '../models/api';
import { API_BASE_URL } from './api';
import { CarritoService } from './carrito';

describe('CarritoService', () => {
  let service: CarritoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CarritoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the authenticated cart endpoint', () => {
    const items: ItemCarrito[] = [];

    service.ver().subscribe(result => expect(result).toEqual(items));
    http.expectOne(`${API_BASE_URL}/carrito`).flush(items);
  });

  it('adds product identifiers and quantities to the API', () => {
    service.agregar(8, 2).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/carrito/agregar`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ id_producto: 8, cantidad: 2 });
    request.flush({ mensaje: 'Agregado' });
  });
});
