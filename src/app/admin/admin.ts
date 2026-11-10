import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { Compra, Usuario } from '../models/api';
import { Producto } from '../models/productos';
import { API_BASE_URL } from '../servicios/api';
import { ComprasService } from '../servicios/compras';
import { NotificacionesService } from '../servicios/notificaciones';
import { ProductosService } from '../servicios/productos';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  productos: Producto[] = [];
  usuarios: Usuario[] = [];
  ventas: Compra[] = [];
  formulario: Partial<Producto> = this.nuevoFormulario();
  archivoElegido: File | null = null;
  vistaPrevia = '';
  cargando = false;
  guardando = false;
  error = '';

  constructor(
    private readonly http: HttpClient,
    private readonly productosService: ProductosService,
    private readonly comprasService: ComprasService,
    private readonly notificaciones: NotificacionesService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargando = true;
    this.error = '';
    forkJoin({
      productos: this.productosService.listar(),
      usuarios: this.http.get<Usuario[]>(`${API_BASE_URL}/usuarios/todos`),
      ventas: this.comprasService.todas(),
    }).subscribe({
      next: resultado => {
        this.productos = resultado.productos;
        this.usuarios = resultado.usuarios;
        this.ventas = resultado.ventas;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos de administración.';
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  editar(producto: Producto): void {
    this.formulario = { ...producto };
    this.archivoElegido = null;
    this.vistaPrevia = '';
  }

  cancelarEdicion(): void {
    this.liberarVistaPrevia();
    this.formulario = this.nuevoFormulario();
    this.archivoElegido = null;
    this.vistaPrevia = '';
  }

  alElegirArchivo(evento: Event): void {
    const input = evento.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const archivo = input.files?.[0] ?? null;
    input.value = '';
    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.notificaciones.mostrar('Selecciona un archivo de imagen válido.', 'warning');
      return;
    }

    this.liberarVistaPrevia();
    this.archivoElegido = archivo;
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  imagenUrl(imagen: string): string {
    return this.productosService.imagenUrl(imagen);
  }

  guardar(): void {
    const nombre = this.formulario.nombre?.trim() ?? '';
    const descripcion = this.formulario.descripcion?.trim() ?? '';
    const precio = Number(this.formulario.precio);

    if (this.guardando || !nombre || !descripcion || !Number.isFinite(precio) || precio < 0) {
      this.notificaciones.mostrar('Revisa los datos del producto.', 'warning');
      return;
    }

    this.guardando = true;
    if (this.archivoElegido) {
      this.productosService.subirImagen(this.archivoElegido).subscribe({
        next: respuesta => this.guardarProducto(nombre, descripcion, precio, respuesta.imagen),
        error: () => {
          this.guardando = false;
          this.notificaciones.mostrar('No se pudo subir la imagen.', 'error');
          this.changeDetector.markForCheck();
        },
      });
      return;
    }

    this.guardarProducto(nombre, descripcion, precio, this.formulario.imagen ?? '');
  }

  eliminar(id: number): void {
    void this.notificaciones.confirmarEliminacion('¿Quieres eliminar este producto?').then(confirmado => {
      if (!confirmado) {
        return;
      }

      this.productosService.eliminar(id).subscribe({
        next: () => {
          this.notificaciones.mostrar('Producto eliminado.', 'success');
          this.cargarTodo();
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.notificaciones.mostrar('No se pudo eliminar el producto.', 'error');
          this.changeDetector.markForCheck();
        },
      });
    });
  }

  private guardarProducto(
    nombre: string,
    descripcion: string,
    precio: number,
    imagen: string,
  ): void {
    const datos = { nombre, descripcion, precio, imagen };
    const solicitud = this.formulario.id
      ? this.productosService.editar(this.formulario.id, datos)
      : this.productosService.crear(datos);

    solicitud.subscribe({
      next: () => {
        this.guardando = false;
        this.cancelarEdicion();
        this.notificaciones.mostrar('Producto guardado.', 'success');
        this.cargarTodo();
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.guardando = false;
        this.notificaciones.mostrar('No se pudo guardar el producto.', 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  private nuevoFormulario(): Partial<Producto> {
    return { nombre: '', descripcion: '', precio: 0, imagen: '' };
  }

  private liberarVistaPrevia(): void {
    if (this.vistaPrevia.startsWith('blob:')) {
      URL.revokeObjectURL(this.vistaPrevia);
    }
  }
}
