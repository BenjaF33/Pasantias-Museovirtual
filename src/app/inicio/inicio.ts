import { afterNextRender, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Hecho } from '../models/hechos';
import { AuthService } from '../servicios/auth-service';
import { EventosService } from '../servicios/eventos';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-inicio',
  imports: [FormsModule],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private eventoSolicitadoIndex: number | null = null;

  readonly coloresPuntos = [
    '#8b6548', '#96714f', '#a07b55', '#aa865e', '#ae9368', '#a59a70',
    '#929778', '#788f7e', '#5e8583', '#3f7888', '#176c91',
  ];
  hechos: Hecho[] = [];
  hechoSeleccionado: Hecho | null = null;
  hechoAmpliado: Hecho | null = null;
  hechoEnEdicion: Hecho | null = null;
  borradorEdicion = { titulo: '', anio: '', descripcion: '', img: [] as string[] };
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

  ngOnInit() {
    this.hechos = this.eventosService.obtenerEventos();
    const anio = this.route.snapshot.queryParamMap.get('anio');
    const titulo = this.route.snapshot.queryParamMap.get('titulo');

    if (anio && titulo) {
      const indice = this.hechos.findIndex(hecho => hecho.anio === anio && hecho.titulo === titulo);
      if (indice !== -1) {
        this.hechoSeleccionado = this.hechos[indice];
        this.eventoSolicitadoIndex = indice;
      }
    }
  }

  get puedeEditarEventos(): boolean {
    return this.authService.esAdmin();
  }

  iniciarEdicion(hecho: Hecho): void {
    if (!this.puedeEditarEventos) {
      return;
    }

    this.hechoEnEdicion = hecho;
    this.borradorEdicion = {
      titulo: hecho.titulo,
      anio: hecho.anio,
      descripcion: hecho.descripcion,
      img: [...hecho.img],
    };
  }

  async agregarImagenes(event: Event): Promise<void> {
    if (!this.hechoEnEdicion || !this.puedeEditarEventos) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    input.value = '';
    const borrador = this.borradorEdicion;

    const imagenes = archivos.filter(archivo => archivo.type.startsWith('image/'));
    if (imagenes.length !== archivos.length) {
      this.notificaciones.mostrar('Solo se pueden añadir archivos de imagen.', 'warning');
    }

    if (imagenes.length === 0) {
      return;
    }

    this.imagenesCargando++;
    try {
      const nuevasImagenes = await Promise.all(imagenes.map(archivo => this.leerImagen(archivo)));
      if (this.borradorEdicion === borrador) {
        this.borradorEdicion.img = [...borrador.img, ...nuevasImagenes];
      }
    } catch {
      this.notificaciones.mostrar('No se pudieron leer las imágenes seleccionadas.', 'error');
    } finally {
      this.imagenesCargando--;
    }
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
        } else {
          reject(new Error('El archivo no produjo una imagen válida.'));
        }
      };
      reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(archivo);
    });
  }

  cancelarEdicion(): void {
    this.hechoEnEdicion = null;
  }

  guardarEdicion(): void {
    const hecho = this.hechoEnEdicion;
    if (!hecho || !this.puedeEditarEventos || this.imagenesCargando > 0) {
      if (hecho && this.imagenesCargando > 0) {
        this.notificaciones.mostrar('Espera a que termine la carga de las imágenes.', 'info');
      }
      return;
    }

    const titulo = this.borradorEdicion.titulo.trim();
    const anio = this.borradorEdicion.anio.trim();
    const descripcion = this.borradorEdicion.descripcion.trim();
    if (!titulo || !anio || !descripcion) {
      return;
    }

    Object.assign(hecho, { titulo, anio, descripcion, img: [...this.borradorEdicion.img] });
    this.hechoEnEdicion = null;
    this.notificaciones.mostrar(
      'Cambios aplicados en pantalla; todavía no se guardaron en la base de datos.',
      'info',
    );
  }

  esFavorito(hecho: Hecho): boolean {
    return this.favoritosService.contieneHecho(hecho);
  }

  async alternarFavorito(hecho: Hecho): Promise<void> {
    const yaEsFavorito = this.favoritosService.contieneHecho(hecho);
    if (yaEsFavorito) {
      const confirmar = await this.notificaciones.confirmarEliminacion(
        '¿Quieres eliminar este favorito?',
      );
      if (!confirmar) {
        return;
      }
    }

    this.favoritosService.alternarHecho(hecho);
    this.notificaciones.mostrar(
      yaEsFavorito ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      yaEsFavorito ? 'info' : 'success',
    );
  }

  mostrarHecho(hecho: Hecho) {
    if (this.hechoSeleccionado === hecho) {
      this.cerrarCard();
      return;
    }

    clearTimeout(this.cierreCardTimeout);
    this.cierreCardTimeout = undefined;
    this.cerrandoCard = false;
    this.hechoSeleccionado = hecho;
  }

  mostrarInfo(hecho: Hecho) {
    clearTimeout(this.cierreInfoTimeout);
    this.cierreInfoTimeout = undefined;
    this.cerrandoInfo = false;
    this.imagenActiva = 0;
    this.imagenAgrandada = false;
    this.imagenesCarrusel = hecho.img.filter(imagen => imagen.trim().length > 0);
    this.hechoAmpliado = hecho;
  }

  seleccionarImagen(indice: number) {
    this.imagenActiva = indice;
  }

  imagenAnterior() {
    if (this.imagenesCarrusel.length === 0) {
      return;
    }

    this.imagenActiva = (this.imagenActiva - 1 + this.imagenesCarrusel.length) % this.imagenesCarrusel.length;
  }

  imagenSiguiente() {
    if (this.imagenesCarrusel.length === 0) {
      return;
    }

    this.imagenActiva = (this.imagenActiva + 1) % this.imagenesCarrusel.length;
  }

  cerrarInfo() {
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

  cerrarCard() {
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

  agrandarimg() {
    this.imagenAgrandada = !this.imagenAgrandada;
  }
}
