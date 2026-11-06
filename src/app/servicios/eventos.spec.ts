import { describe, expect, it } from 'vitest';

import { EventosService } from './eventos';

describe('EventosService', () => {
  const service = new EventosService();

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
