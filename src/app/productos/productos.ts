import { Component } from '@angular/core';
import { Producto } from '../models/productos';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';
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
    private productosService: ProductosService,
    private notificaciones: NotificacionesService,
  ) { }

  ngOnInit() {
    this.productos = this.productosService.obtenerProductos();
    
  }

  agregarCarrito(producto: Producto) {
    const yaAgregado = this.carritoService.obtenerProductos().some(item => item.id === producto.id);
    this.carritoService.agregarProducto(producto);
    if (!yaAgregado) {
      this.notificaciones.mostrar('Agregado al carrito', 'success');
    }
  }

  manejarErrorImagen(event: Event) {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/Fotos/Cipolletti hoy/CipoHoy1.JPG';
    }
  }
}
