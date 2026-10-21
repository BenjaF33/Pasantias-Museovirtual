import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {

   productos: any[] = [];

  obtenerProductos() {
    return this.productos;
  }
  
  agregarProducto(producto: any) {
    const productoExistente = this.productos.find(p => p.id === producto.id);
    if (productoExistente) {
      productoExistente.cantidad ++;

    } else {
      this.productos.push(producto);
    }
  }

  eliminarProducto(producto: any) {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos.splice(index, 1);
    }
  }
  
}
