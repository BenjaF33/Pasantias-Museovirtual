import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../servicios/auth-service';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';
import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  let component: Favoritos;
  let fixture: ComponentFixture<Favoritos>;
  const auth = { estaLogueado: vi.fn() };
  const favoritos = { listar: vi.fn(), eliminar: vi.fn() };
  const notificaciones = { confirmarEliminacion: vi.fn(), mostrar: vi.fn() };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
    favoritos.listar.mockReturnValue(of([]));
    favoritos.eliminar.mockReturnValue(of({ mensaje: 'Eliminado' }));

    await TestBed.configureTestingModule({
      imports: [Favoritos],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: FavoritosService, useValue: favoritos },
        { provide: NotificacionesService, useValue: notificaciones },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Favoritos);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads the signed-in user favorites from the API', () => {
    expect(component).toBeTruthy();
    expect(favoritos.listar).toHaveBeenCalled();
    expect(component.favoritos).toEqual([]);
  });

  it('shows a login link when the user is not authenticated', async () => {
    auth.estaLogueado.mockReturnValue(false);
    favoritos.listar.mockClear();

    fixture = TestBed.createComponent(Favoritos);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(favoritos.listar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Inicia sesión');
  });
});
