import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Producto } from '../models/productos';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';
import { ProductosService } from '../servicios/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  productoEnEdicion: Producto | null = null;
  creandoProducto = false;
  imagenCargando = false;
  borradorProducto = { nombre: '', descripcion: '', precio: 0, stock: 0, imagen: '' };

  constructor(
    private readonly carritoService: CarritoService,
    private readonly productosService: ProductosService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.productos = this.productosService.obtenerProductos();
  }

  get puedeEditarProductos(): boolean {
    return this.authService.esAdmin();
  }

  iniciarCreacionProducto(): void {
    if (!this.puedeEditarProductos) {
      return;
    }

    this.productoEnEdicion = null;
    this.creandoProducto = true;
    this.borradorProducto = { nombre: '', descripcion: '', precio: 0, stock: 0, imagen: '' };
    this.changeDetector.detectChanges();
  }

  iniciarEdicionProducto(producto: Producto): void {
    if (!this.puedeEditarProductos) {
      return;
    }

    this.creandoProducto = false;
    this.productoEnEdicion = producto;
    this.borradorProducto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen,
    };
  }

  cancelarEdicionProducto(): void {
    this.productoEnEdicion = null;
    this.creandoProducto = false;
  }

  async agregarImagen(event: Event): Promise<void> {
    if ((!this.productoEnEdicion && !this.creandoProducto) || !this.puedeEditarProductos) {
      return;
    }

    const input = event.target as HTMLInputElement | null;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const archivo = input.files?.[0];
    input.value = '';

    if (!archivo) {
      return;
    }

    if (this.borradorProducto.imagen) {
      this.notificaciones.mostrar('Quita la imagen actual antes de añadir otra.', 'warning');
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.notificaciones.mostrar('Solo se pueden añadir archivos de imagen.', 'warning');
      return;
    }

    this.imagenCargando = true;
    try {
      const imagen = await this.leerImagen(archivo);
      this.borradorProducto = { ...this.borradorProducto, imagen };
    } catch {
      this.notificaciones.mostrar('No se pudo leer la imagen seleccionada.', 'error');
    } finally {
      this.imagenCargando = false;
    }
  }

  quitarImagen(): void {
    this.borradorProducto.imagen = '';
  }

  private leerImagen(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('El archivo no produjo una imagen válida.'));
      };
      reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo.'));
      reader.onabort = () => reject(new Error('La lectura de la imagen fue cancelada.'));
      reader.readAsDataURL(archivo);
    });
  }

  guardarProducto(): void {
    if ((!this.productoEnEdicion && !this.creandoProducto) || !this.puedeEditarProductos || this.imagenCargando) {
      return;
    }

    const nombre = this.borradorProducto.nombre.trim();
    const descripcion = this.borradorProducto.descripcion.trim();
    const imagen = this.borradorProducto.imagen.trim();
    const precio = Number(this.borradorProducto.precio);
    const stock = Number(this.borradorProducto.stock);

    if (!nombre || !descripcion || !Number.isFinite(precio) || precio < 0 ||
      !Number.isInteger(stock) || stock < 0) {
      this.notificaciones.mostrar('Revisa los datos del producto e inténtalo de nuevo.', 'warning');
      return;
    }

    if (this.creandoProducto) {
      const id = this.productos.reduce((mayorId, producto) => Math.max(mayorId, producto.id), 0) + 1;
      this.productos.push({ id, nombre, descripcion, precio, stock, imagen, cantidad: 0 });
      this.cancelarEdicionProducto();
      this.changeDetector.detectChanges();
      this.notificaciones.mostrar('Producto agregado en pantalla; todavía no se guardó en la base de datos.', 'info');
      return;
    }

    if (this.productoEnEdicion) {
      Object.assign(this.productoEnEdicion, { nombre, descripcion, precio, stock, imagen });
      this.cancelarEdicionProducto();
      this.changeDetector.detectChanges();
      this.notificaciones.mostrar('Cambios aplicados en pantalla; todavía no se guardaron en la base de datos.', 'info');
    }
  }

  agregarCarrito(producto: Producto): void {
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

  manejarErrorImagen(event: Event): void {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/Fotos/Cipolletti hoy/CipoHoy1.JPG';
    }
  }
}
