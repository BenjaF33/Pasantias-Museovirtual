import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  productos: any[] = [];

  obtenerProductos() {
    return this.productos;
  }
  
  agregarProducto(producto: any) {
    const productoExistente = this.productos.find(p => p.id === producto.id);
    if (productoExistente) {
      productoExistente.cantidad += 1;

    } else {
      producto.cantidad = 1;
      this.productos.push(producto);
     
      
    }
  }

  eliminarProducto(producto: any) {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos.splice(index, 1);
    }
  }

  editarProducto(producto: any, accion:boolean) {
    const index = this.productos.findIndex(p => p.id === producto.id);
      if (accion) {
        this.productos[index].cantidad++;
      } else {
        this.productos[index].cantidad--;
        if (this.productos[index].cantidad <= 0) {
          this.productos.splice(index, 1);
        }
      }
  }

  obtenerTotal()
  {
    return this.productos.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
  }

  finalizarCompra() {
    alert('Compra finalizada. Total: $' + this.obtenerTotal().toFixed(2));
    this.productos = [];
  }
}
