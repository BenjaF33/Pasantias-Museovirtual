import { Injectable } from '@angular/core';
import { Producto } from '../models/productos';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  productos: Producto[] = [];

  obtenerProductos(): Producto[] {
    return this.productos;
  }

  agregarProducto(producto: Producto): void {
    const productoExistente = this.productos.find(p => p.id === producto.id);
    if (productoExistente) {
      return;
    }

    producto.cantidad = 1;
    this.productos.push(producto);
  }

  eliminarProducto(producto: Producto): void {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos.splice(index, 1);
    }
  }

  obtenerTotal(): number {
    return this.productos.reduce((total, producto) => total + producto.precio, 0);
  }

  finalizarCompra(): void {
    alert('Compra finalizada. Total: $' + this.obtenerTotal().toFixed(2));
    this.productos = [];
  }
}
