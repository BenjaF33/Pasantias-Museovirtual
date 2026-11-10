import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

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
    favoritos.listar.mockReturnValue(of([]));
    favoritos.agregar.mockReturnValue(of({ mensaje: 'Agregado' }));
    favoritos.eliminar.mockReturnValue(of({ mensaje: 'Eliminado' }));

    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: AuthService, useValue: auth },
        { provide: EventosService, useValue: { listar: () => of([hecho]), obtenerEventos: () => [hecho], filtrarEventos: () => [hecho] } },
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
});
