import { afterNextRender, ChangeDetectorRef, Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { type BorradorEvento, type Hecho } from '../models/hechos';
import { AuthService } from '../servicios/auth-service';
import { EventosService } from '../servicios/eventos';
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
  borradorEdicion: BorradorEvento = { titulo: '', anio: '', descripcion: '', descripcion_larga: '', img: [] };
  imagenesCargando = 0;
  imagenActiva = 0;
  imagenAgrandada = false;
  imagenesCarrusel: string[] = [];
  cerrandoCard = false;
  cerrandoInfo = false;

  private cierreCardTimeout: ReturnType<typeof setTimeout> | undefined;
  private cierreInfoTimeout: ReturnType<typeof setTimeout> | undefined;

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
  }

  iniciarCreacionEvento(): void {
    if (!this.puedeEditarEventos) {
      return;
    }

    this.hechoEnEdicion = null;
    this.creandoEvento = true;
    this.borradorEdicion = { titulo: '', anio: '', descripcion: '', descripcion_larga: '', img: [] };
  }

  async agregarImagenes(event: Event): Promise<void> {
    if ((!this.hechoEnEdicion && !this.creandoEvento) || !this.puedeEditarEventos) {
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

    const imagenesValidas = archivos.filter(archivo => archivo.type.startsWith('image/'));
    if (imagenesValidas.length === 0) {
      this.notificaciones.mostrar('Solo se pueden añadir archivos de imagen.', 'warning');
      return;
    }

    if (imagenesValidas.length !== archivos.length) {
      this.notificaciones.mostrar('Se ignoraron algunos archivos porque no eran imágenes.', 'warning');
    }

    const borradorActual = this.borradorEdicion;
    const imagenesLeidas: string[] = [];

    for (const archivo of imagenesValidas) {
      this.imagenesCargando += 1;
      try {
        imagenesLeidas.push(await this.leerImagen(archivo));
      } catch {
        this.notificaciones.mostrar(`No se pudo leer la imagen: ${archivo.name}`, 'error');
      } finally {
        this.imagenesCargando = Math.max(0, this.imagenesCargando - 1);
      }
    }

    if (this.borradorEdicion !== borradorActual) {
      return;
    }

    this.borradorEdicion.img = [...this.borradorEdicion.img, ...imagenesLeidas];
    this.changeDetector.detectChanges();
  }

  quitarImagen(indice: number): void {
    this.borradorEdicion.img = this.borradorEdicion.img.filter((_, i) => i !== indice);
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
    this.hechoEnEdicion = null;
    this.creandoEvento = false;
    this.imagenesCargando = 0;
  }

  guardarEdicion(): void {
    const hecho = this.hechoEnEdicion;
    const formularioAbierto = hecho !== null || this.creandoEvento;

    if (!formularioAbierto || !this.puedeEditarEventos || this.imagenesCargando > 0) {
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

    if (this.creandoEvento) {
      const id_evento = this.hechos.reduce(
        (mayorId, evento) => Math.max(mayorId, evento.id_evento),
        0,
      ) + 1;
      const nuevoHecho: Hecho = {
        id_evento,
        titulo,
        anio,
        descripcion,
        descripcion_larga,
        img: [...this.borradorEdicion.img],
      };
      const indice = this.hechos.findIndex(evento => Number(evento.anio) > Number(anio));
      if (indice === -1) {
        this.hechos.push(nuevoHecho);
      } else {
        this.hechos.splice(indice, 0, nuevoHecho);
      }

      this.cancelarEdicion();
      this.notificaciones.mostrar(
        'Acontecimiento agregado en pantalla; todavía no se guardó en la base de datos.',
        'info',
      );
      return;
    }

    if (hecho) {
      Object.assign(hecho, {
        titulo,
        anio,
        descripcion,
        descripcion_larga,
        img: [...this.borradorEdicion.img],
      });

      this.cancelarEdicion();
      this.notificaciones.mostrar(
        'Cambios aplicados en pantalla; todavía no se guardaron en la base de datos.',
        'info',
      );
    }
  }

  esFavorito(hecho: Hecho): boolean {
    return this.favoritos.some(favorito => favorito.id_evento === hecho.id_evento);
  }

  async alternarFavorito(hecho: Hecho): Promise<void> {
    const yaEsFavorito = this.esFavorito(hecho);

    if (!yaEsFavorito && !this.authService.estaLogueado()) {
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
      error: () => {
        this.notificaciones.mostrar('No se pudo actualizar favoritos.', 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  private cargarFavoritos(): void {
    this.favoritosService.listar().subscribe({
      next: favoritos => {
        this.favoritos = favoritos;
        this.changeDetector.markForCheck();
      },
      error: () => {
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
