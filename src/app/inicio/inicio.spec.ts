import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { Inicio } from './inicio';
import { AuthService } from '../servicios/auth-service';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;
  const auth = { estaLogueado: vi.fn(), esAdmin: vi.fn() };
  const router = { navigate: vi.fn() };
  const favoritos = {
    contieneHecho: vi.fn(),
    alternarHecho: vi.fn(),
  };
  const notificaciones = {
    confirmarEliminacion: vi.fn(),
    mostrar: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.estaLogueado.mockReturnValue(true);
    auth.esAdmin.mockReturnValue(false);
    favoritos.contieneHecho.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: FavoritosService, useValue: favoritos },
        { provide: NotificacionesService, useValue: notificaciones },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects unauthenticated users to login without adding an event to favorites', async () => {
    const hecho = { anio: '1881', titulo: 'Tendido telegráfico', img: [], descripcion: '', info: '' };
    auth.estaLogueado.mockReturnValue(false);

    await component.alternarFavorito(hecho);

    expect(router.navigate).toHaveBeenCalledWith(['/inicio-sesion']);
    expect(favoritos.alternarHecho).not.toHaveBeenCalled();
    expect(notificaciones.mostrar).not.toHaveBeenCalled();
  });

  it('adds an event to favorites when the user is authenticated', async () => {
    const hecho = { anio: '1881', titulo: 'Tendido telegráfico', img: [], descripcion: '', info: '' };

    await component.alternarFavorito(hecho);

    expect(router.navigate).not.toHaveBeenCalled();
    expect(favoritos.alternarHecho).toHaveBeenCalledWith(hecho);
    expect(notificaciones.mostrar).toHaveBeenCalledWith('Agregado a favoritos', 'success');
  });

  it('shows carousel arrows only when there is more than one image', () => {
    component.mostrarInfo({ anio: '1881', titulo: 'Tendido telegráfico', img: ['imagen-1.jpg'] });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.carousel-control-prev').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.carousel-control-next').length).toBe(0);

    component.mostrarInfo({ anio: '1879', titulo: 'Fuerte Confluencia', img: ['imagen-1.jpg', 'imagen-2.jpg'] });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.carousel-control-prev').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.carousel-control-next').length).toBe(1);
  });
});
