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

  it('creates an event using the API field names and stores image paths', () => {
    service.crear({
      anio: '1881',
      titulo: 'Tendido telegráfico',
      img: ['/assets/Fotos/telegrafo.jpg', `${API_BASE_URL}/uploads/evento.jpg`],
      descripcion: 'Descripción',
      descripcion_larga: 'Texto completo',
    }).subscribe(respuesta => {
      expect(respuesta.id_evento).toBe(3);
    });

    const request = http.expectOne(`${API_BASE_URL}/eventos`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      titulo: 'Tendido telegráfico',
      anio: '1881',
      imagen_1: 'assets/Fotos/telegrafo.jpg',
      imagen_2: 'uploads/evento.jpg',
      imagen_3: '',
      descripcion_corta: 'Descripción',
      descripcion_larga: 'Texto completo',
    });
    request.flush({ mensaje: 'Evento creado', id_evento: 3 }, { status: 201, statusText: 'Created' });
  });

  it('updates an event through its API identifier', () => {
    service.editar(3, {
      anio: '1882',
      titulo: 'Telégrafo ampliado',
      img: [],
      descripcion: 'Descripción actualizada',
      descripcion_larga: 'Texto completo actualizado',
    }).subscribe(respuesta => {
      expect(respuesta.mensaje).toBe('Evento actualizado');
    });

    const request = http.expectOne(`${API_BASE_URL}/eventos/3`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      titulo: 'Telégrafo ampliado',
      anio: '1882',
      imagen_1: '',
      imagen_2: '',
      imagen_3: '',
      descripcion_corta: 'Descripción actualizada',
      descripcion_larga: 'Texto completo actualizado',
    });
    request.flush({ mensaje: 'Evento actualizado' });
  });

  it('deletes an event through its API identifier', () => {
    service.eliminar(3).subscribe(respuesta => {
      expect(respuesta.mensaje).toBe('Evento eliminado');
    });

    const request = http.expectOne(`${API_BASE_URL}/eventos/3`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ mensaje: 'Evento eliminado' });
  });

  it('uploads event images to the requested image field', () => {
    const archivo = new File(['imagen'], 'evento.jpg', { type: 'image/jpeg' });
    service.subirImagen(archivo, 'imagen_2').subscribe(url => {
      expect(url).toBe(`${API_BASE_URL}/uploads/evento.jpg`);
    });

    const request = http.expectOne(`${API_BASE_URL}/eventos/imagen/imagen_2`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('imagen')).toBe(archivo);
    request.flush({ imagen_2: 'evento.jpg' }, { status: 201, statusText: 'Created' });
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
