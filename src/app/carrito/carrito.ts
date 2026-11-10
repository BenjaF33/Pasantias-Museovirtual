import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ItemCarrito } from '../models/api';
import { AuthService } from '../servicios/auth-service';
import { API_BASE_URL } from '../servicios/api';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  productos: ItemCarrito[] = [];
  estaLogueado = false;
  cargando = false;
  error = '';

  constructor(
    private readonly carritoService: CarritoService,
    private readonly notificaciones: NotificacionesService,
    private readonly router: Router,
    authService: AuthService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.estaLogueado = authService.estaLogueado();
  }

  ngOnInit(): void {
    if (this.estaLogueado) {
      this.cargarProductos();
    }
  }

  get total(): number {
    return this.productos.reduce(
      (suma, producto) => suma + producto.cantidad * Number(producto.precio_unitario),
      0,
    );
  }

  get cantidadTotal(): number {
    return this.productos.reduce((suma, producto) => suma + producto.cantidad, 0);
  }

  imagenUrl(imagen: string): string {
    if (/^(https?:|data:|blob:)/i.test(imagen) || imagen.startsWith('/assets/')) {
      return imagen;
    }
    return `${API_BASE_URL}/uploads/${imagen}`;
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';
    this.carritoService.ver().subscribe({
      next: productos => {
        this.productos = productos;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudo cargar el carrito. Inicia sesión nuevamente e inténtalo.';
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  cambiarCantidad(producto: ItemCarrito, cantidad: number): void {
    if (cantidad < 1) {
      this.quitarProducto(producto);
      return;
    }

    this.carritoService.actualizar(producto.id_producto, cantidad).subscribe({
      next: () => this.cargarProductos(),
      error: () => this.notificaciones.mostrar('No se pudo actualizar la cantidad.', 'error'),
    });
  }

  async quitarProducto(producto: ItemCarrito): Promise<void> {
    const confirmar = await this.notificaciones.confirmarEliminacion(
      '¿Quieres eliminar este producto?',
    );
    if (!confirmar) {
      return;
    }

    this.carritoService.eliminar(producto.id_producto).subscribe({
      next: () => {
        this.notificaciones.mostrar('Eliminado del carrito', 'info');
        this.cargarProductos();
      },
      error: () => this.notificaciones.mostrar('No se pudo eliminar el producto.', 'error'),
    });
  }

  vaciarCarrito(): void {
    this.carritoService.vaciar().subscribe({
      next: () => {
        this.productos = [];
        this.notificaciones.mostrar('Carrito vaciado.', 'info');
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.notificaciones.mostrar('No se pudo vaciar el carrito.', 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  finalizarCompra(): void {
    if (!this.estaLogueado) {
      void this.router.navigate(['/inicio-sesion']);
      return;
    }
    void this.router.navigate(['/paginas/compra']);
  }
}
