import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Inicio } from './inicio';
import { AuthService } from '../servicios/auth-service';
import { EventosService } from '../servicios/eventos';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;
  const hecho = {
    id_evento: 4,
    anio: '1881',
    titulo: 'Tendido telegráfico',
    img: [],
    descripcion: '',
    descripcion_larga: '',
  };
  const auth = { estaLogueado: vi.fn(), esAdmin: vi.fn() };
  const eventos = {
    listar: vi.fn(),
    obtenerEventos: vi.fn(),
    filtrarEventos: vi.fn(),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
    subirImagen: vi.fn(),
  };
  const favoritos = {
    listar: vi.fn(),
    agregar: vi.fn(),
    eliminar: vi.fn(),
  };
  const router = { navigate: vi.fn() };
  const notificaciones = {
    confirmarEliminacion: vi.fn(),
    mostrar: vi.fn(),
  };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
    auth.esAdmin.mockReturnValue(false);
    notificaciones.confirmarEliminacion.mockResolvedValue(false);
    favoritos.listar.mockReturnValue(of([]));
    favoritos.agregar.mockReturnValue(of({ mensaje: 'Agregado' }));
    favoritos.eliminar.mockReturnValue(of({ mensaje: 'Eliminado' }));
    eventos.listar.mockReturnValue(of([hecho]));
    eventos.obtenerEventos.mockReturnValue([hecho]);
    eventos.filtrarEventos.mockImplementation((_termino, lista = [hecho]) => lista);
    eventos.crear.mockReturnValue(of({ mensaje: 'Evento creado', id_evento: 5 }));
    eventos.editar.mockReturnValue(of({ mensaje: 'Evento actualizado' }));
    eventos.eliminar.mockReturnValue(of({ mensaje: 'Evento eliminado' }));
    eventos.subirImagen.mockReturnValue(of('https://api.test/uploads/evento.jpg'));

    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: AuthService, useValue: auth },
        { provide: EventosService, useValue: eventos },
        { provide: FavoritosService, useValue: favoritos },
        { provide: NotificacionesService, useValue: notificaciones },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    vi.clearAllMocks();
  });

  it('creates the home component', () => {
    expect(component).toBeTruthy();
  });

  it('only displays the back-to-top button after scrolling down', () => {
    expect(component.mostrarBotonVolverArriba()).toBe(false);

    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(301);
    component.actualizarBotonVolverArriba();

    expect(component.mostrarBotonVolverArriba()).toBe(true);
  });

  it('scrolls smoothly to the top when the back-to-top button is activated', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    component.volverArriba();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('redirects unauthenticated users to login without adding a favorite', async () => {
    auth.estaLogueado.mockReturnValue(false);

    await component.alternarFavorito(hecho);

    expect(router.navigate).toHaveBeenCalledWith(['/inicio-sesion']);
    expect(favoritos.agregar).not.toHaveBeenCalled();
  });

  it('adds an event to the API-backed favorites list', async () => {
    await component.alternarFavorito(hecho);

    expect(favoritos.agregar).toHaveBeenCalledWith(hecho.id_evento);
    expect(component.esFavorito(hecho)).toBe(true);
    expect(notificaciones.mostrar).toHaveBeenCalledWith('Agregado a favoritos', 'success');
  });

  it('creates an event through the API and adds the returned identifier to the timeline', async () => {
    auth.esAdmin.mockReturnValue(true);
    component.iniciarCreacionEvento();
    component.borradorEdicion = {
      titulo: 'Evento nuevo',
      anio: '1900',
      descripcion: 'Descripción',
      descripcion_larga: 'Texto completo',
      img: [],
    };

    await component.guardarEdicion();

    expect(eventos.crear).toHaveBeenCalledWith({
      titulo: 'Evento nuevo',
      anio: '1900',
      descripcion: 'Descripción',
      descripcion_larga: 'Texto completo',
      img: [],
    });
    expect(component.hechos.some(evento => evento.id_evento === 5)).toBe(true);
    expect(notificaciones.mostrar).toHaveBeenCalledWith(
      'Acontecimiento guardado en la base de datos.',
      'success',
    );
  });

  it('updates an event through the API before changing the timeline', async () => {
    auth.esAdmin.mockReturnValue(true);
    component.iniciarEdicion(hecho);
    component.borradorEdicion = {
      titulo: 'Título editado',
      anio: '1882',
      descripcion: 'Descripción editada',
      descripcion_larga: 'Texto editado',
      img: [],
    };

    await component.guardarEdicion();

    expect(eventos.editar).toHaveBeenCalledWith(hecho.id_evento, {
      titulo: 'Título editado',
      anio: '1882',
      descripcion: 'Descripción editada',
      descripcion_larga: 'Texto editado',
      img: [],
    });
    expect(hecho.titulo).toBe('Título editado');
    expect(notificaciones.mostrar).toHaveBeenCalledWith(
      'Cambios guardados en la base de datos.',
      'success',
    );
  });

  it('asks for confirmation before deleting an event and removes it after API success', async () => {
    auth.esAdmin.mockReturnValue(true);
    notificaciones.confirmarEliminacion.mockResolvedValue(true);
    component.hechos = [hecho];
    component.favoritos = [hecho];
    component.hechoSeleccionado = hecho;

    await component.eliminarEvento(hecho);

    expect(notificaciones.confirmarEliminacion).toHaveBeenCalledWith(
      '¿Eliminar el acontecimiento «Tendido telegráfico»? Esta acción no se puede deshacer.',
    );
    expect(eventos.eliminar).toHaveBeenCalledWith(hecho.id_evento);
    expect(component.hechos).toEqual([]);
    expect(component.favoritos).toEqual([]);
    expect(component.hechoSeleccionado).toBeNull();
    expect(notificaciones.mostrar).toHaveBeenCalledWith('Acontecimiento eliminado.', 'success');
  });

  it('does not call the API when event deletion is not confirmed', async () => {
    auth.esAdmin.mockReturnValue(true);
    component.hechos = [hecho];

    await component.eliminarEvento(hecho);

    expect(eventos.eliminar).not.toHaveBeenCalled();
    expect(component.hechos).toEqual([hecho]);
  });

  it('keeps the event in the timeline if the API rejects deletion', async () => {
    auth.esAdmin.mockReturnValue(true);
    notificaciones.confirmarEliminacion.mockResolvedValue(true);
    eventos.eliminar.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 403,
      error: { error: 'No autorizado, se requiere rol admin' },
    })));
    component.hechos = [hecho];

    await component.eliminarEvento(hecho);

    expect(component.hechos).toEqual([hecho]);
    expect(notificaciones.mostrar).toHaveBeenCalledWith(
      'No se pudo eliminar el acontecimiento (HTTP 403): No autorizado, se requiere rol admin',
      'error',
    );
  });

  it('shows the API response when saving an event is rejected', async () => {
    auth.esAdmin.mockReturnValue(true);
    eventos.crear.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 403,
      error: { error: 'No autorizado, se requiere rol admin' },
    })));
    component.iniciarCreacionEvento();
    component.borradorEdicion = {
      titulo: 'Evento nuevo',
      anio: '1900',
      descripcion: 'Descripción',
      descripcion_larga: 'Texto completo',
      img: [],
    };

    await component.guardarEdicion();

    expect(notificaciones.mostrar).toHaveBeenCalledWith(
      'No se pudo guardar el acontecimiento (HTTP 403): No autorizado, se requiere rol admin',
      'error',
    );
    expect(component.creandoEvento).toBe(true);
  });

  it('shows a connection diagnostic when saving fails with HTTP status zero', async () => {
    auth.esAdmin.mockReturnValue(true);
    eventos.crear.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.iniciarCreacionEvento();
    component.borradorEdicion = {
      titulo: 'Evento nuevo',
      anio: '1900',
      descripcion: 'Descripción',
      descripcion_larga: 'Texto completo',
      img: [],
    };

    await component.guardarEdicion();

    expect(notificaciones.mostrar).toHaveBeenCalledWith(
      'No se pudo conectar con la API (HTTP 0). Comprueba que Apache esté activo y que la app use http://localhost:4200.',
      'error',
    );
  });

  it('explains when a successful HTTP response cannot be parsed as JSON', async () => {
    auth.esAdmin.mockReturnValue(true);
    eventos.editar.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 200,
      error: {
        error: new SyntaxError('Unexpected token'),
        text: '<br>Warning: malformed response',
      },
    })));
    component.iniciarEdicion(hecho);
    component.borradorEdicion = {
      titulo: 'Título editado',
      anio: '1882',
      descripcion: 'Descripción',
      descripcion_larga: 'Texto',
      img: [],
    };

    await component.guardarEdicion();

    expect(notificaciones.mostrar).toHaveBeenCalledWith(
      'La API respondió HTTP 200, pero su respuesta no es JSON válido: <br>Warning: malformed response',
      'error',
    );
    expect(hecho.titulo).toBe('Tendido telegráfico');
  });
});
