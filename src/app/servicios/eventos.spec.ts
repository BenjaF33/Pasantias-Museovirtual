import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from './api';
import { EventosService } from './eventos';

describe('EventosService', () => {
  let service: EventosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EventosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads every API event and sorts the timeline chronologically', () => {
    service.listar().subscribe(eventos => {
      expect(eventos.map(evento => evento.id_evento)).toEqual([1, 2]);
      expect(eventos[0].img).toEqual([`${API_BASE_URL}/uploads/primero.jpg`]);
      expect(eventos[1].descripcion).toBe('Descripción');
    });

    http.expectOne(`${API_BASE_URL}/eventos`).flush([
      {
        id_evento: '2',
        anio: 1900,
        nombre: 'Segundo',
        imagen_1: 'segundo.jpg',
        imagen_2: null,
        imagen_3: null,
        descripcion_corta: 'Descripción',
        descripcion_larga: 'Texto',
      },
      {
        id_evento: '1',
        anio: 1830,
        titulo: 'Primero',
        imagen_1: 'primero.jpg',
        imagen_2: '',
        imagen_3: null,
        descripcion_corta: 'Descripción',
        descripcion_larga: 'Texto',
      },
    ]);
  });

  // Verifica coincidencias por año y por título. La búsqueda también debe encontrar
  // "Tendido telegráfico" al escribir "TELEGRAFICO", sin importar mayúsculas ni tildes.
  it('filtra por año o título sin distinguir mayúsculas ni tildes', () => {
    const eventos = [
      { id_evento: 1, anio: '1899', titulo: 'Llegada del ferrocarril', img: [], descripcion: '', descripcion_larga: '' },
      { id_evento: 2, anio: '1881', titulo: 'Tendido telegráfico', img: [], descripcion: '', descripcion_larga: '' },
    ];

    expect(service.filtrarEventos('1899', eventos).map(evento => evento.id_evento)).toEqual([1]);
    expect(service.filtrarEventos('TELEGRAFICO', eventos).map(evento => evento.id_evento)).toEqual([2]);
  });

  // Si el usuario no ingresa un término (o solo escribe espacios), se conserva
  // la lista completa de eventos recibida.
  it('devuelve todos los eventos cuando la búsqueda está vacía', () => {
    const eventos = [
      { id_evento: 1, anio: '1899', titulo: 'Llegada del ferrocarril', img: [], descripcion: '', descripcion_larga: '' },
    ];

    expect(service.filtrarEventos('  ', eventos)).toBe(eventos);
  });
});
