import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Productos } from './productos';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';
import { ProductosService } from '../servicios/productos';

describe('Productos', () => {
  let component: Productos;
  let fixture: ComponentFixture<Productos>;
  const producto = {
    id: 1,
    nombre: 'Libro',
    descripcion: 'Descripción',
    precio: 100,
    stock: 5,
    imagen: '',
    cantidad: 0,
  };
  const auth = { estaLogueado: vi.fn(), esAdmin: vi.fn() };
  const carrito = {
    obtenerProductos: vi.fn(),
    agregarProducto: vi.fn(),
  };
  const router = { navigate: vi.fn() };
  const notificaciones = { mostrar: vi.fn() };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
    auth.esAdmin.mockReturnValue(true);
    carrito.obtenerProductos.mockReturnValue([]);

    await TestBed.configureTestingModule({
      imports: [Productos],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CarritoService, useValue: carrito },
        { provide: ProductosService, useValue: { obtenerProductos: () => [producto] } },
        { provide: NotificacionesService, useValue: notificaciones },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Productos);
    component = fixture.componentInstance;
    await fixture.whenStable();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('redirects users who are not logged in to the login page without adding the product', () => {
    auth.estaLogueado.mockReturnValue(false);

    component.agregarCarrito(producto);

    expect(router.navigate).toHaveBeenCalledWith(['/inicio-sesion']);
    expect(carrito.agregarProducto).not.toHaveBeenCalled();
    expect(notificaciones.mostrar).not.toHaveBeenCalled();
  });

  it('adds the product to the cart when the user is logged in', () => {
    component.agregarCarrito(producto);

    expect(router.navigate).not.toHaveBeenCalled();
    expect(carrito.agregarProducto).toHaveBeenCalledWith(producto);
    expect(notificaciones.mostrar).toHaveBeenCalledWith('Agregado al carrito', 'success');
  });

  it('creates a product with the next id and its form values', () => {
    component.iniciarCreacionProducto();
    component.borradorProducto = {
      nombre: 'Nuevo libro',
      descripcion: 'Descripción nueva',
      precio: 250,
      stock: 8,
      imagen: '/assets/libro.jpg',
    };

    component.guardarProducto();

    expect(component.productos[1]).toEqual({
      id: 2,
      nombre: 'Nuevo libro',
      descripcion: 'Descripción nueva',
      precio: 250,
      stock: 8,
      imagen: '/assets/libro.jpg',
      cantidad: 0,
    });
    expect(component.creandoProducto).toBe(false);
  });

  it('updates the selected product without changing its id or cart quantity', () => {
    const seleccionado = { ...producto, cantidad: 2 };
    component.productos = [seleccionado];
    component.iniciarEdicionProducto(seleccionado);
    component.borradorProducto = {
      nombre: 'Libro actualizado',
      descripcion: 'Descripción actualizada',
      precio: 300,
      stock: 4,
      imagen: '/assets/actualizado.jpg',
    };

    component.guardarProducto();

    expect(seleccionado).toEqual({
      id: 1,
      nombre: 'Libro actualizado',
      descripcion: 'Descripción actualizada',
      precio: 300,
      stock: 4,
      imagen: '/assets/actualizado.jpg',
      cantidad: 2,
    });
    expect(component.productoEnEdicion).toBeNull();
  });

  it('allows removing the current product image', () => {
    component.iniciarEdicionProducto({ ...producto, imagen: '/assets/libro.jpg' });

    component.quitarImagen();

    expect(component.borradorProducto.imagen).toBe('');
  });
});
