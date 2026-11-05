import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';

import { Carrito } from './carrito';

describe('Carrito', () => {
  let component: Carrito;
  let fixture: ComponentFixture<Carrito>;
  const auth = { estaLogueado: vi.fn() };
  const carrito = {
    obtenerProductos: vi.fn(),
    obtenerTotal: vi.fn(),
  };
  const notificaciones = {
    confirmarEliminacion: vi.fn(),
    mostrar: vi.fn(),
  };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
    carrito.obtenerProductos.mockReturnValue([]);
    carrito.obtenerTotal.mockReturnValue(0);

    await TestBed.configureTestingModule({
      imports: [Carrito],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CarritoService, useValue: carrito },
        { provide: NotificacionesService, useValue: notificaciones },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Carrito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the empty cart message and links to products when logged in', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tu carrito está vacío');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/productos');
  });

  it('asks logged-out users to sign in and links to the login page', async () => {
    auth.estaLogueado.mockReturnValue(false);

    fixture = TestBed.createComponent(Carrito);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Inicia sesión para poder agregar productos al carrito.',
    );
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/inicio-sesion');
    expect(fixture.nativeElement.textContent).not.toContain('Tu carrito está vacío');
  });
});
