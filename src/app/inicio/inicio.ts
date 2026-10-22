import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Hecho } from '../models/hechos';
import { EventosService } from '../servicios/eventos';
import { FavoritosService } from '../servicios/favoritos';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly coloresPuntos = [
    '#8b6548', '#96714f', '#a07b55', '#aa865e', '#ae9368', '#a59a70',
    '#929778', '#788f7e', '#5e8583', '#3f7888', '#176c91',
  ];
  hechos: Hecho[] = [];
  hechoSeleccionado: Hecho | null = null;
  hechoAmpliado: Hecho | null = null;
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
  ) {}

  ngOnInit() {
    this.hechos = this.eventosService.obtenerEventos();
  }

  esFavorito(hecho: Hecho): boolean {
    return this.favoritosService.contieneHecho(hecho);
  }

  alternarFavorito(hecho: Hecho) {
    this.favoritosService.alternarHecho(hecho);
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
