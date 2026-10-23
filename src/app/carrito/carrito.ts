import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Producto } from '../models/productos';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  productos: Producto[];

  constructor(
    private carritoService: CarritoService,
    private notificaciones: NotificacionesService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.productos = this.carritoService.obtenerProductos();
  }

  get total(): number {
    return this.carritoService.obtenerTotal();
  }

  get cantidadTotal(): number {
    return this.productos.length;
  }

  async quitarProducto(producto: Producto): Promise<void> {
    const estabaEnCarrito = this.productos.some(item => item.id === producto.id);
    if (!estabaEnCarrito) {
      return;
    }

    const confirmar = await this.notificaciones.confirmarEliminacion(
      '¿Quieres eliminar este producto?',
    );
    if (!confirmar) {
      return;
    }

    this.carritoService.eliminarProducto(producto);
    this.actualizarProductos();
    this.changeDetector.detectChanges();
    this.notificaciones.mostrar('Eliminado del carrito', 'info');
  }

  finalizarCompra(): void {
    this.carritoService.finalizarCompra();
    this.actualizarProductos();
  }

  private actualizarProductos(): void {
    this.productos = this.carritoService.obtenerProductos();
  }
}
