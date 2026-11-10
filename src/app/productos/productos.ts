import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Producto } from '../models/productos';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { NotificacionesService } from '../servicios/notificaciones';
import { ProductosService } from '../servicios/productos';

@Component({
  selector: 'app-productos',
  imports: [FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly carritoService = inject(CarritoService);
  private readonly productosService = inject(ProductosService);
  private readonly notificaciones = inject(NotificacionesService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  productoEnEdicion: Producto | null = null;
  creandoProducto = false;
  cargando = false;
  guardando = false;
  busqueda = '';
  error = '';
  archivoImagen: File | null = null;
  vistaPreviaImagen = '';
  borradorProducto: Partial<Producto> = this.nuevoBorrador();

  ngOnInit(): void {
    this.cargarProductos();
  }

  get puedeEditarProductos(): boolean {
    return this.authService.esAdmin();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';
    this.productosService.listar(this.busqueda).subscribe({
      next: productos => {
        this.productos = productos;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos. Inténtalo nuevamente.';
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  imagenUrl(imagen: string): string {
    return this.productosService.imagenUrl(imagen);
  }

  iniciarCreacionProducto(): void {
    if (!this.puedeEditarProductos) {
      return;
    }

    this.productoEnEdicion = null;
    this.creandoProducto = true;
    this.reiniciarBorrador();
  }

  iniciarEdicionProducto(producto: Producto): void {
    if (!this.puedeEditarProductos) {
      return;
    }

    this.creandoProducto = false;
    this.productoEnEdicion = producto;
    this.borradorProducto = { ...producto };
    this.archivoImagen = null;
    this.vistaPreviaImagen = '';
  }

  cancelarEdicionProducto(): void {
    if (this.vistaPreviaImagen.startsWith('blob:')) {
      URL.revokeObjectURL(this.vistaPreviaImagen);
    }
    this.productoEnEdicion = null;
    this.creandoProducto = false;
    this.reiniciarBorrador();
  }

  agregarImagen(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const archivo = input.files?.[0] ?? null;
    input.value = '';
    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.notificaciones.mostrar('Solo se pueden añadir archivos de imagen.', 'warning');
      return;
    }

    if (this.vistaPreviaImagen.startsWith('blob:')) {
      URL.revokeObjectURL(this.vistaPreviaImagen);
    }
    this.archivoImagen = archivo;
    this.vistaPreviaImagen = URL.createObjectURL(archivo);
  }

  quitarImagen(): void {
    if (this.vistaPreviaImagen.startsWith('blob:')) {
      URL.revokeObjectURL(this.vistaPreviaImagen);
    }
    this.archivoImagen = null;
    this.vistaPreviaImagen = '';
    this.borradorProducto.imagen = '';
  }

  guardarProducto(): void {
    if ((!this.productoEnEdicion && !this.creandoProducto) || !this.puedeEditarProductos || this.guardando) {
      return;
    }

    const nombre = this.borradorProducto.nombre?.trim() ?? '';
    const descripcion = this.borradorProducto.descripcion?.trim() ?? '';
    const precio = Number(this.borradorProducto.precio);
    if (!nombre || !descripcion || !Number.isFinite(precio) || precio < 0) {
      this.notificaciones.mostrar('Revisa los datos del producto e inténtalo de nuevo.', 'warning');
      return;
    }

    this.guardando = true;
    const guardar = (imagen: string): void => {
      const datos = { nombre, descripcion, precio, imagen };
      const solicitud = this.creandoProducto
        ? this.productosService.crear(datos)
        : this.productoEnEdicion
          ? this.productosService.editar(this.productoEnEdicion.id, datos)
          : null;

      if (!solicitud) {
        this.guardando = false;
        return;
      }

      solicitud.subscribe({
        next: () => {
          this.guardando = false;
          this.cancelarEdicionProducto();
          this.notificaciones.mostrar('Producto guardado correctamente.', 'success');
          this.cargarProductos();
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.guardando = false;
          this.notificaciones.mostrar('No se pudo guardar el producto.', 'error');
          this.changeDetector.markForCheck();
        },
      });
    };

    if (this.archivoImagen) {
      this.productosService.subirImagen(this.archivoImagen).subscribe({
        next: respuesta => guardar(respuesta.imagen),
        error: () => {
          this.guardando = false;
          this.notificaciones.mostrar('No se pudo subir la imagen del producto.', 'error');
          this.changeDetector.markForCheck();
        },
      });
      return;
    }

    guardar(this.borradorProducto.imagen ?? '');
  }

  eliminarProducto(producto: Producto): void {
    if (!this.puedeEditarProductos) {
      return;
    }

    void this.notificaciones.confirmarEliminacion(`¿Quieres eliminar "${producto.nombre}"?`).then(confirmado => {
      if (!confirmado) {
        return;
      }

      this.productosService.eliminar(producto.id).subscribe({
        next: () => {
          this.notificaciones.mostrar('Producto eliminado.', 'success');
          this.cargarProductos();
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.notificaciones.mostrar('No se pudo eliminar el producto.', 'error');
          this.changeDetector.markForCheck();
        },
      });
    });
  }

  agregarCarrito(producto: Producto): void {
    if (!this.authService.estaLogueado()) {
      void this.router.navigate(['/inicio-sesion']);
      return;
    }

    this.carritoService.agregar(producto.id, 1).subscribe({
      next: () => this.notificaciones.mostrar('Agregado al carrito', 'success'),
      error: () => this.notificaciones.mostrar('No se pudo agregar al carrito.', 'error'),
    });
  }

  manejarErrorImagen(event: Event): void {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/Fotos/Cipolletti hoy/CipoHoy1.JPG';
    }
  }

  private nuevoBorrador(): Partial<Producto> {
    return { nombre: '', descripcion: '', precio: 0, imagen: '' };
  }

  private reiniciarBorrador(): void {
    this.archivoImagen = null;
    this.vistaPreviaImagen = '';
    this.borradorProducto = this.nuevoBorrador();
  }
}
