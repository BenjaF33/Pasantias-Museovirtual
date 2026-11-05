import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../servicios/auth-service';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';


import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  let component: Favoritos;
  let fixture: ComponentFixture<Favoritos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favoritos],
      providers: [provideRouter([])],
  const auth = { estaLogueado: vi.fn() };
  const favoritos = { obtenerHechos: vi.fn(() => []) };
  const notificaciones = { confirmarEliminacion: vi.fn(), mostrar: vi.fn() };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('asks logged-out users to sign in and links to the login page', async () => {
    auth.estaLogueado.mockReturnValue(false);

    fixture = TestBed.createComponent(Favoritos);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Inicia sesión para poder agregar hechos a favoritos.',
    );
    expect(fixture.nativeElement.querySelector('.estado-vacio a').getAttribute('href'))
      .toBe('/inicio-sesion');
    expect(fixture.nativeElement.textContent).not.toContain('Aún no tienes favoritos');
  });

});
