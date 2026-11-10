import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from './api';
import { FavoritosService } from './favoritos';

describe('FavoritosService', () => {
  let service: FavoritosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FavoritosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps API event favorites to the timeline model', () => {
    service.listar().subscribe(favoritos => {
      expect(favoritos).toEqual([{
        id_evento: 5,
        anio: '1886',
        img: [`${API_BASE_URL}/uploads/puente.jpg`],
        titulo: 'Cipolletti',
        descripcion: 'Descripción',
        descripcion_larga: 'Texto completo',
      }]);
    });

    http.expectOne(`${API_BASE_URL}/favoritos`).flush([{
      id_evento: '5',
      anio: 1886,
      titulo: 'Cipolletti',
      imagen_1: 'puente.jpg',
      imagen_2: '',
      imagen_3: null,
      descripcion_corta: 'Descripción',
      descripcion_larga: 'Texto completo',
    }]);
  });

  it('sends event identifiers when adding a favorite', () => {
    service.agregar(5).subscribe();

    const request = http.expectOne(`${API_BASE_URL}/favoritos/agregar`);
    expect(request.request.body).toEqual({ id_evento: 5 });
    request.flush({ mensaje: 'Agregado' });
  });
});
