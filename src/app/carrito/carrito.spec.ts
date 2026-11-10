import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { Carrito } from './carrito';
import { ItemCarrito } from '../models/api';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';

describe('Carrito', () => {
  let component: Carrito;
  let fixture: ComponentFixture<Carrito>;
  const items: ItemCarrito[] = [
    { id_producto: 2, nombre: 'Libro', imagen: 'libro.jpg', cantidad: 2, precio_unitario: 100 },
  ];
  const carrito = { ver: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn(), vaciar: vi.fn() };
  const auth = { estaLogueado: vi.fn() };
  const notificaciones = { confirmarEliminacion: vi.fn(), mostrar: vi.fn() };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
    carrito.ver.mockReturnValue(of(items));
    carrito.actualizar.mockReturnValue(of({ mensaje: 'Actualizado' }));

    await TestBed.configureTestingModule({
      imports: [Carrito],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: CarritoService, useValue: carrito },
        { provide: NotificacionesService, useValue: notificaciones },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Carrito);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    vi.clearAllMocks();
  });

  it('loads cart items and calculates totals from API prices and quantities', () => {
    expect(component.productos).toEqual(items);
    expect(component.total).toBe(200);
    expect(component.cantidadTotal).toBe(2);
  });

  it('updates item quantity through the API', () => {
    component.cambiarCantidad(items[0], 3);

    expect(carrito.actualizar).toHaveBeenCalledWith(items[0].id_producto, 3);
    expect(carrito.ver).toHaveBeenCalled();
  });

  it('navigates to the purchase summary', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.finalizarCompra();

    expect(navigateSpy).toHaveBeenCalledWith(['/paginas/compra']);
  });
});
