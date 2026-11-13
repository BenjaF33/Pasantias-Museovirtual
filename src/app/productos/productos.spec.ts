import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { Productos } from './productos';
import { Producto } from '../models/productos';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';
import { ProductosService } from '../servicios/productos';

describe('Productos', () => {
  let component: Productos;
  let fixture: ComponentFixture<Productos>;
  const producto: Producto = {
    id: 1,
    nombre: 'Libro',
    descripcion: 'Descripción',
    precio: 100,
    imagen: 'libro.jpg',
  };
  const auth = { estaLogueado: vi.fn(), esAdmin: vi.fn() };
  const carrito = { agregar: vi.fn() };
  const productosService = {
    listar: vi.fn(),
    imagenUrl: vi.fn((imagen: string) => imagen),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
    subirImagen: vi.fn(),
  };
  const notificaciones = { mostrar: vi.fn(), confirmarEliminacion: vi.fn() };
  const router = { navigate: vi.fn() };

  beforeEach(async () => {
    auth.estaLogueado.mockReturnValue(true);
    auth.esAdmin.mockReturnValue(true);
    productosService.listar.mockReturnValue(of([producto]));
    productosService.crear.mockReturnValue(of({ mensaje: 'Creado' }));
    carrito.agregar.mockReturnValue(of({ mensaje: 'Agregado' }));

    await TestBed.configureTestingModule({
      imports: [Productos],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CarritoService, useValue: carrito },
        { provide: ProductosService, useValue: productosService },
        { provide: NotificacionesService, useValue: notificaciones },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Productos);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    vi.clearAllMocks();
  });

  it('loads products from the catalog service', () => {
    expect(component.productos).toEqual([producto]);
  });

  it('renders the API response without waiting for another user interaction', async () => {
    const respuesta = new Subject<Producto[]>();
    productosService.listar.mockReturnValueOnce(respuesta);
    fixture.autoDetectChanges();

    component.cargarProductos();
    respuesta.next([{ ...producto, nombre: 'Producto actualizado desde la API' }]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Producto actualizado desde la API');
  });

  it('filters products through the API service', () => {
    component.busqueda = 'libro';
    component.cargarProductos();

    expect(productosService.listar).toHaveBeenCalledWith('libro');
  });

  it('adds the selected product to the remote cart', () => {
    component.agregarCarrito(producto);

    expect(carrito.agregar).toHaveBeenCalledWith(producto.id, 1);
    expect(notificaciones.mostrar).toHaveBeenCalledWith('Agregado al carrito', 'success');
  });

  it('creates a product in the API instead of mutating the local catalog', () => {
    component.iniciarCreacionProducto();
    component.borradorProducto = {
      nombre: 'Nuevo libro',
      descripcion: 'Descripción nueva',
      precio: 250,
      imagen: '',
    };

    component.guardarProducto();

    expect(productosService.crear).toHaveBeenCalledWith({
      nombre: 'Nuevo libro',
      descripcion: 'Descripción nueva',
      precio: 250,
      imagen: '',
    });
  });

  it('explains when a product cannot be deleted because it is referenced by a cart', async () => {
    const mensaje = 'No se puede eliminar el producto porque está asociado a un carrito o a una compra.';
    notificaciones.confirmarEliminacion.mockResolvedValue(true);
    productosService.eliminar.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: { error: mensaje },
    })));

    component.eliminarProducto(producto);
    await vi.waitFor(() => expect(notificaciones.mostrar).toHaveBeenCalledWith(mensaje, 'error'));
  });
});
