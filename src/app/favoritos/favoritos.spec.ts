import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../servicios/auth-service';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';
import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  let component: Favoritos;
  let fixture: ComponentFixture<Favoritos>;
  const auth = { estaLogueado: vi.fn(), logout: vi.fn() };
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

  it('clears a rejected session and explains that the user must sign in again', () => {
    favoritos.listar.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 401,
      error: { error: 'Token inválido o vencido' },
    })));

    component.cargarFavoritos();
    fixture.detectChanges();

    expect(auth.logout).toHaveBeenCalled();
    expect(component.estaLogueado).toBe(false);
    expect(component.error).toContain('HTTP 401');
    expect(component.error).toContain('Token inválido o vencido');
    expect(fixture.nativeElement.textContent).toContain('Inicia sesión nuevamente.');
  });

  it('explains when the API cannot be reached', () => {
    favoritos.listar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    component.cargarFavoritos();

    expect(component.error).toContain('No se pudo conectar con la API');
  });
});
