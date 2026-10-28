import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../models/productos';
import { AuthService } from '../servicios/auth-service';
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
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.productos = this.productosService.obtenerProductos();
    
  }

  agregarCarrito(producto: Producto) {
    if (!this.authService.estaLogueado()) {
      void this.router.navigate(['/inicio-sesion']);
      return;
    }

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
