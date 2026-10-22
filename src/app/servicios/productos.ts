import { Injectable } from '@angular/core';
import { Producto } from '../models/productos';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  productos: Producto[] = [{
    id: 1,
    nombre: 'Cipolletti de ayer para el hoy',
    descripcion: 'Un recorrido por la microhistoria de Cipolletti, de Liliana Graciela Fedeli Ferracuti.',
    precio: 10000,
    stock: 100,
    imagen: '/assets/WhatsApp Image 2026-10-22 at 08.47.45.jpeg',
    cantidad: 0,
  },
  {
    id: 2,
    nombre: 'Gitanos: Una mirada que muchos no ven',
    descripcion: 'Una mirada a la cultura gitana, de Liliana Graciela Fedeli.',
    precio: 15000,
    stock: 50,
    imagen: '/assets/gitanos.jpeg',
    cantidad: 0
  }
  ];


  obtenerProductos(): Producto[] {
    return this.productos;
  }
}
