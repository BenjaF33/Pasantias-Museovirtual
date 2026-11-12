import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, ChangeDetectorRef, Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { type BorradorEvento, type Hecho } from '../models/hechos';
import { AuthService } from '../servicios/auth-service';
import { CampoImagenEvento, EventosService } from '../servicios/eventos';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly mostrarBotonVolverArriba = signal(false);

  private eventoSolicitadoIndex: number | null = null;

  readonly coloresPuntos = [
    '#8b6548', '#96714f', '#a07b55', '#aa865e', '#ae9368', '#a59a70',
    '#929778', '#788f7e', '#5e8583', '#3f7888', '#176c91',
  ];

  hechos: Hecho[] = [];
  favoritos: Hecho[] = [];
  cargandoEventos = false;
  errorEventos = '';
  busquedaEventos = '';
  hechoSeleccionado: Hecho | null = null;
  hechoAmpliado: Hecho | null = null;
  hechoEnEdicion: Hecho | null = null;
  creandoEvento = false;
  eliminandoEventoId: number | null = null;
  borradorEdicion: BorradorEvento = { titulo: '', anio: '', descripcion: '', descripcion_larga: '', img: [] };
  imagenesCargando = 0;
  guardandoEvento = false;
  imagenActiva = 0;
  imagenAgrandada = false;
  imagenesCarrusel: string[] = [];
  cerrandoCard = false;
  cerrandoInfo = false;

  private cierreCardTimeout: ReturnType<typeof setTimeout> | undefined;
  private cierreInfoTimeout: ReturnType<typeof setTimeout> | undefined;
  private imagenesPendientes: Array<File | null> = [];

  constructor(
    private readonly favoritosService: FavoritosService,
    private readonly eventosService: EventosService,
    private readonly notificaciones: NotificacionesService,
  ) {
    afterNextRender(() => {
      if (this.eventoSolicitadoIndex !== null) {
        document.getElementById(`evento-${this.eventoSolicitadoIndex}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    });
  }

  ngOnInit(): void {
    this.cargarEventos();
    if (this.authService.estaLogueado()) {
      this.cargarFavoritos();
    }
  }

  @HostListener('window:scroll')
  actualizarBotonVolverArriba(): void {
    this.mostrarBotonVolverArriba.set(window.scrollY > 300);
  }

  volverArriba(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private cargarEventos(): void {
    this.cargandoEventos = true;
    this.eventosService.listar().subscribe({
      next: eventos => {
        this.hechos = eventos;
        this.errorEventos = '';
        this.cargandoEventos = false;
        this.seleccionarEventoSolicitado();
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.hechos = this.eventosService.obtenerEventos();
        this.errorEventos = 'No se pudo conectar con la API. Se muestran solo los eventos de ejemplo; inicia la API para ver el catálogo completo.';
        this.cargandoEventos = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  private seleccionarEventoSolicitado(): void {
    const anio = this.route.snapshot.queryParamMap.get('anio');
    const titulo = this.route.snapshot.queryParamMap.get('titulo');

    if (anio && titulo) {
      const indice = this.hechos.findIndex(hecho => hecho.anio === anio && hecho.titulo === titulo);
      if (indice !== -1) {
        this.hechoSeleccionado = this.hechos[indice];
        this.eventoSolicitadoIndex = indice;
        this.changeDetector.detectChanges();
        document.getElementById(`evento-${indice}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }

  get puedeEditarEventos(): boolean {
    return this.authService.esAdmin();
  }

  get eventosFiltrados(): Hecho[] {
    return this.eventosService.filtrarEventos(this.busquedaEventos, this.hechos);
  }

  actualizarBusqueda(termino: string): void {
    this.busquedaEventos = termino;

    if (this.hechoSeleccionado && !this.eventosFiltrados.includes(this.hechoSeleccionado)) {
      clearTimeout(this.cierreCardTimeout);
      this.cierreCardTimeout = undefined;
      this.hechoSeleccionado = null;
      this.cerrandoCard = false;
    }
  }

  iniciarEdicion(hecho: Hecho): void {
    if (!this.puedeEditarEventos) {
      return;
    }

    this.creandoEvento = false;
    this.hechoEnEdicion = hecho;
    this.borradorEdicion = {
      titulo: hecho.titulo,
      anio: hecho.anio,
      descripcion: hecho.descripcion,
      descripcion_larga: hecho.descripcion_larga,
      img: [...hecho.img],
    };
    this.imagenesPendientes = hecho.img.map(() => null);
  }

  iniciarCreacionEvento(): void {
    if (!this.puedeEditarEventos) {
      return;
    }

    this.hechoEnEdicion = null;
    this.creandoEvento = true;
    this.borradorEdicion = { titulo: '', anio: '', descripcion: '', descripcion_larga: '', img: [] };
    this.imagenesPendientes = [];
  }

  async agregarImagenes(event: Event): Promise<void> {
    if ((!this.hechoEnEdicion && !this.creandoEvento) || !this.puedeEditarEventos || this.guardandoEvento) {
      return;
    }

    const input = event.target as HTMLInputElement | null;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const archivos = Array.from(input.files ?? []);
    input.value = '';

    if (archivos.length === 0) {
      return;
    }

    const imagenesValidas = archivos.filter(archivo =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type),
    );
    if (imagenesValidas.length === 0) {
      this.notificaciones.mostrar('Solo se admiten imágenes JPG, PNG o WEBP.', 'warning');
      return;
    }

    if (imagenesValidas.length !== archivos.length) {
      this.notificaciones.mostrar('Se ignoraron archivos no compatibles; usa JPG, PNG o WEBP.', 'warning');
    }

    const borradorActual = this.borradorEdicion;
    const pendientesActuales = this.imagenesPendientes;
    const espaciosDisponibles = 3 - borradorActual.img.length;
    if (espaciosDisponibles <= 0) {
      this.notificaciones.mostrar('Cada acontecimiento admite hasta 3 imágenes.', 'warning');
      return;
    }

    const imagenesParaAgregar = imagenesValidas.slice(0, espaciosDisponibles);
    if (imagenesParaAgregar.length < imagenesValidas.length) {
      this.notificaciones.mostrar('Solo se pueden guardar hasta 3 imágenes por acontecimiento.', 'warning');
    }
    const imagenesLeidas: string[] = [];
    const archivosLeidos: File[] = [];

    for (const archivo of imagenesParaAgregar) {
      this.imagenesCargando += 1;
      try {
        imagenesLeidas.push(await this.leerImagen(archivo));
        archivosLeidos.push(archivo);
      } catch {
        this.notificaciones.mostrar(`No se pudo leer la imagen: ${archivo.name}`, 'error');
      } finally {
        this.imagenesCargando = Math.max(0, this.imagenesCargando - 1);
      }
    }

    if (this.borradorEdicion !== borradorActual || this.imagenesPendientes !== pendientesActuales) {
      return;
    }

    this.borradorEdicion.img = [...this.borradorEdicion.img, ...imagenesLeidas];
    this.imagenesPendientes.push(...archivosLeidos);
    this.changeDetector.detectChanges();
  }

  quitarImagen(indice: number): void {
    if (this.guardandoEvento) {
      return;
    }

    this.borradorEdicion.img = this.borradorEdicion.img.filter((_, i) => i !== indice);
    this.imagenesPendientes = this.imagenesPendientes.filter((_, i) => i !== indice);
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

  cancelarEdicion(): void {
    if (this.guardandoEvento) {
      return;
    }

    this.hechoEnEdicion = null;
    this.creandoEvento = false;
    this.imagenesCargando = 0;
    this.imagenesPendientes = [];
  }

  async guardarEdicion(): Promise<void> {
    const hecho = this.hechoEnEdicion;
    const formularioAbierto = hecho !== null || this.creandoEvento;

    if (!formularioAbierto || !this.puedeEditarEventos || this.imagenesCargando > 0 || this.guardandoEvento) {
      if (formularioAbierto && this.imagenesCargando > 0) {
        this.notificaciones.mostrar('Espera a que termine la carga de las imágenes.', 'info');
      }
      return;
    }

    const titulo = this.borradorEdicion.titulo.trim();
    const anio = this.borradorEdicion.anio.trim();
    const descripcion = this.borradorEdicion.descripcion.trim();
    const descripcion_larga = this.borradorEdicion.descripcion_larga.trim();

    if (!titulo || !anio || !descripcion || !descripcion_larga) {
      return;
    }

    this.guardandoEvento = true;
    try {
      const imagenes = await Promise.all(this.borradorEdicion.img.map(async (imagen, indice) => {
        const archivo = this.imagenesPendientes[indice];
        if (!archivo) {
          return imagen;
        }

        const campo = `imagen_${indice + 1}` as CampoImagenEvento;
        return firstValueFrom(this.eventosService.subirImagen(archivo, campo));
      }));
      const datosEvento = {
        titulo,
        anio,
        descripcion,
        descripcion_larga,
        img: imagenes,
      };

      if (this.creandoEvento) {
        const respuesta = await firstValueFrom(this.eventosService.crear(datosEvento));
        const id_evento = Number(respuesta.id_evento);
        if (!Number.isFinite(id_evento)) {
          throw new Error('La API no devolvió el identificador del acontecimiento creado.');
        }
        this.hechos = [...this.hechos, { id_evento, ...datosEvento }]
          .sort((a, b) => Number(a.anio) - Number(b.anio) || a.id_evento - b.id_evento);
        this.guardandoEvento = false;
        this.cancelarEdicion();
        this.notificaciones.mostrar('Acontecimiento guardado en la base de datos.', 'success');
      } else {
        if (!hecho) {
          return;
        }

        await firstValueFrom(this.eventosService.editar(hecho.id_evento, datosEvento));
        Object.assign(hecho, datosEvento);
        this.hechos = [...this.hechos]
          .sort((a, b) => Number(a.anio) - Number(b.anio) || a.id_evento - b.id_evento);
        this.guardandoEvento = false;
        this.cancelarEdicion();
        this.notificaciones.mostrar('Cambios guardados en la base de datos.', 'success');
      }
    } catch (error: unknown) {
      this.notificaciones.mostrar(this.mensajeErrorAlGuardar(error), 'error');
    } finally {
      this.guardandoEvento = false;
    }
  }

  async eliminarEvento(hecho: Hecho): Promise<void> {
    if (!this.puedeEditarEventos || this.eliminandoEventoId !== null) {
      return;
    }

    const confirmado = await this.notificaciones.confirmarEliminacion(
      `¿Eliminar el acontecimiento «${hecho.titulo}»? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) {
      return;
    }

    this.eliminandoEventoId = hecho.id_evento;
    try {
      await firstValueFrom(this.eventosService.eliminar(hecho.id_evento));
      this.hechos = this.hechos.filter(evento => evento.id_evento !== hecho.id_evento);
      this.favoritos = this.favoritos.filter(evento => evento.id_evento !== hecho.id_evento);
      if (this.hechoSeleccionado?.id_evento === hecho.id_evento) {
        this.hechoSeleccionado = null;
      }
      if (this.hechoAmpliado?.id_evento === hecho.id_evento) {
        this.hechoAmpliado = null;
      }
      this.notificaciones.mostrar('Acontecimiento eliminado.', 'success');
    } catch (error: unknown) {
      this.notificaciones.mostrar(this.mensajeErrorAlEliminar(error), 'error');
    } finally {
      this.eliminandoEventoId = null;
    }
  }

  private mensajeErrorAlEliminar(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const mensaje = error.error?.error;
      if (typeof mensaje === 'string') {
        return `No se pudo eliminar el acontecimiento (HTTP ${error.status}): ${mensaje}`;
      }
      if (error.status === 0) {
        return 'No se pudo conectar con la API para eliminar el acontecimiento.';
      }
      return `No se pudo eliminar el acontecimiento (HTTP ${error.status}).`;
    }

    if (error instanceof Error) {
      return `No se pudo eliminar el acontecimiento: ${error.message}`;
    }
    return 'No se pudo eliminar el acontecimiento por un error inesperado.';
  }

  private mensajeErrorAlGuardar(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const mensaje = error.error?.error;
      if (typeof mensaje === 'string') {
        return `No se pudo guardar el acontecimiento (HTTP ${error.status}): ${mensaje}`;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con la API (HTTP 0). Comprueba que Apache esté activo y que la app use http://localhost:4200.';
      }

      if (error.status >= 200 && error.status < 300) {
        const respuesta = error.error?.text;
        if (typeof respuesta === 'string' && respuesta.trim()) {
          const detalle = respuesta.trim().replace(/\s+/g, ' ').slice(0, 180);
          return `La API respondió HTTP ${error.status}, pero su respuesta no es JSON válido: ${detalle}`;
        }

        return `La API respondió HTTP ${error.status}, pero devolvió una respuesta vacía o JSON inválido.`;
      }

      return `No se pudo guardar el acontecimiento (HTTP ${error.status}). Revisa la respuesta de la API.`;
    }

    if (error instanceof Error) {
      return `No se pudo guardar el acontecimiento: ${error.message}`;
    }

    return 'No se pudo guardar el acontecimiento por un error inesperado.';
  }

  esFavorito(hecho: Hecho): boolean {
    return this.favoritos.some(favorito => favorito.id_evento === hecho.id_evento);
  }

  async alternarFavorito(hecho: Hecho): Promise<void> {
    const yaEsFavorito = this.esFavorito(hecho);

    if (!yaEsFavorito && !this.authService.estaLogueado()) {
      this.notificaciones.mostrar('Inicia sesión para agregar eventos a favoritos.', 'info');
      void this.router.navigate(['/inicio-sesion']);
      return;
    }

    if (yaEsFavorito) {
      const confirmar = await this.notificaciones.confirmarEliminacion(
        '¿Quieres eliminar este favorito?',
      );

      if (!confirmar) {
        return;
      }
    }

    const solicitud = yaEsFavorito
      ? this.favoritosService.eliminar(hecho.id_evento)
      : this.favoritosService.agregar(hecho.id_evento);
    solicitud.subscribe({
      next: () => {
        this.favoritos = yaEsFavorito
          ? this.favoritos.filter(favorito => favorito.id_evento !== hecho.id_evento)
          : [...this.favoritos, hecho];
        this.notificaciones.mostrar(
          yaEsFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos',
          yaEsFavorito ? 'info' : 'success',
        );
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.authService.logout();
          void this.router.navigate(['/inicio-sesion']);
        }

        this.notificaciones.mostrar(this.mensajeErrorAlActualizarFavoritos(error), 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  private mensajeErrorAlActualizarFavoritos(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con la API para actualizar favoritos.';
      }

      const mensaje = error.error?.error;
      if (typeof mensaje === 'string') {
        return `No se pudo actualizar favoritos (HTTP ${error.status}): ${mensaje}`;
      }

      return `No se pudo actualizar favoritos (HTTP ${error.status}).`;
    }

    return 'No se pudo actualizar favoritos por un error inesperado.';
  }

  private cargarFavoritos(): void {
    this.favoritosService.listar().subscribe({
      next: favoritos => {
        this.favoritos = favoritos;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.authService.logout();
          return;
        }

        this.notificaciones.mostrar('No se pudieron cargar tus favoritos.', 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  mostrarHecho(hecho: Hecho): void {
    if (this.hechoSeleccionado === hecho) {
      this.cerrarCard();
      return;
    }

    clearTimeout(this.cierreCardTimeout);
    this.cierreCardTimeout = undefined;
    this.cerrandoCard = false;
    this.hechoSeleccionado = hecho;
  }

  mostrarInfo(hecho: Hecho): void {
    clearTimeout(this.cierreInfoTimeout);
    this.cierreInfoTimeout = undefined;
    this.cerrandoInfo = false;
    this.imagenActiva = 0;
    this.imagenAgrandada = false;
    this.imagenesCarrusel = hecho.img.filter(imagen => imagen.trim().length > 0);
    this.hechoAmpliado = hecho;
  }

  seleccionarImagen(indice: number): void {
    this.imagenActiva = indice;
  }

  imagenAnterior(): void {
    if (this.imagenesCarrusel.length === 0) {
      return;
    }

    this.imagenActiva = (this.imagenActiva - 1 + this.imagenesCarrusel.length) % this.imagenesCarrusel.length;
  }

  imagenSiguiente(): void {
    if (this.imagenesCarrusel.length === 0) {
      return;
    }

    this.imagenActiva = (this.imagenActiva + 1) % this.imagenesCarrusel.length;
  }

  cerrarInfo(): void {
    if (this.hechoAmpliado === null || this.cerrandoInfo) {
      return;
    }

    this.cerrandoInfo = true;
    this.cierreInfoTimeout = setTimeout(() => {
      this.hechoAmpliado = null;
      this.cerrandoInfo = false;
      this.cierreInfoTimeout = undefined;
      this.changeDetector.detectChanges();
    }, 220);
  }

  cerrarCard(): void {
    if (this.hechoSeleccionado === null || this.cerrandoCard) {
      return;
    }

    this.cerrandoCard = true;
    this.cierreCardTimeout = setTimeout(() => {
      this.hechoSeleccionado = null;
      this.cerrandoCard = false;
      this.cierreCardTimeout = undefined;
      this.changeDetector.detectChanges();
    }, 220);
  }

  agrandarimg(): void {
    this.imagenAgrandada = !this.imagenAgrandada;
  }
}
