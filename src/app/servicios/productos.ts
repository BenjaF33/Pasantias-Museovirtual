import { Injectable } from '@angular/core';
import { Producto } from '../models/productos';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  productos: Producto[] = [{
    id: 1,
    nombre: 'Libro museo Cipolletti',
    descripcion: 'Un libro que contiene la historia del museo de Cipolletti',
    precio: 10000,
    stock: 100,
    imagen: '/assets/Fotos/Cipolletti hoy/CipoHoy.JPG',
    cantidad: 0,
  },
  {
    id: 2,
    nombre: 'Libro Cipolletazo',
    descripcion: 'Un libro que contiene la historia del Cipolletazo',
    precio: 15000,
    stock: 50,
    imagen: '/assets/Fotos/Cipolletti hoy/CipoHoy.JPG',
    cantidad: 0
  }
  ];


  obtenerProductos(): Producto[] {
    return this.productos;
  }
}
