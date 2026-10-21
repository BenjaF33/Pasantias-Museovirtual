import { Component } from '@angular/core';
import { Producto } from '../models/productos';
import { CarritoService } from '../servicios/carrito';
import { ProductosService } from '../servicios/productos';

@Component({
  selector: 'app-productos',
  imports: [],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  productos: Producto[] = [];

  constructor(
    private carritoService: CarritoService,
    private productosService: ProductosService
  ) { }

  ngOnInit() {
    this.productos = this.productosService.obtenerProductos();
    
  }

  agregarCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
  }

  manejarErrorImagen(event: Event) {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/Fotos/Cipolletti hoy/CipoHoy1.JPG';
    }
  }
}
