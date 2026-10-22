import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FavoritosService } from '../servicios/favoritos';
import { EventosService } from '../servicios/eventos';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
})
export class Inicio {
 // mambo para conectar con los services
 //------
  hechos : any[] = [];

 constructor(
    private favoritosService: FavoritosService,
    private eventosService: EventosService
   ) { }

   ngOnInit() {
     this.hechos = this.eventosService.obtenerEventos().map((evento, indice) => ({
       ...evento,
       id: evento.id ?? indice + 1,
     }));
   }

   agregarFavorito(evento : any) {
    this.favoritosService.agregarEvento(evento);
     window.alert('El acontecimiento se agregó a favoritos.');
   }

 

  esFavorito(evento: any): boolean {
    return this.favoritosService.obtenerEventos().some((favorito) => favorito.id === evento.id);
  }

  //mambo extra
  //------

  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly coloresPuntos = ['#8b6548', '#96714f', '#a07b55', '#aa865e', '#ae9368', '#a59a70', '#929778', '#788f7e', '#5e8583', '#3f7888', '#176c91'];

  // Guarda el acontecimiento que el usuario seleccionó
  hechoSeleccionado: any = null;
  // Hecho que se muestra en la ventana ampliada; null significa que el modal está cerrado.
  hechoAmpliado: any = null;
  // Índice de la foto visible actualmente dentro del carrusel.
  imagenActiva = 0;
  imagenAgrandada = false;
  // Imágenes válidas del hecho ampliado; se actualiza cada vez que se abre un hecho.
  imagenesCarrusel: string[] = [];
  cerrandoCard = false;
  cerrandoInfo = false;
  private cierreCardTimeout: ReturnType<typeof setTimeout> | undefined;
  private cierreInfoTimeout: ReturnType<typeof setTimeout> | undefined;


  // Se ejecuta cuando hacemos clic en un punto
  mostrarHecho(h: any) {
    if (this.hechoSeleccionado === h) {
      this.cerrarCard();
      return;
    }

    clearTimeout(this.cierreCardTimeout);
    this.cierreCardTimeout = undefined;
    this.cerrandoCard = false;
    this.hechoSeleccionado = h;
  }

  mostrarInfo(h: any) {
    // Cancela un cierre anterior si el usuario vuelve a abrir información rápidamente.
    clearTimeout(this.cierreInfoTimeout);
    this.cierreInfoTimeout = undefined;
    // Desactiva la animación de cierre y comienza el carrusel desde la primera foto.
    this.cerrandoInfo = false;
    this.imagenActiva = 0;
    this.imagenAgrandada = false;
    // Toma el arreglo img del hecho y descarta valores nulos o textos vacíos.
    const imagenes = Array.isArray(h.img) ? h.img as unknown[] : [];
    this.imagenesCarrusel = imagenes
      .filter((imagen: unknown): imagen is string => typeof imagen === 'string' && imagen.trim().length > 0);
    // Guarda el hecho seleccionado para que Angular renderice el modal.
    this.hechoAmpliado = h;
  }

  // Selecciona directamente una imagen al pulsar uno de los indicadores.
  seleccionarImagen(indice: number) {
    this.imagenActiva = indice;
  }

  // Retrocede una posición; el módulo permite volver a la última imagen desde la primera.
  imagenAnterior() {
    if (this.imagenesCarrusel.length === 0) {
      return;
    }

    this.imagenActiva = (this.imagenActiva - 1 + this.imagenesCarrusel.length) % this.imagenesCarrusel.length;
  }

  // Avanza una posición; el módulo permite volver a la primera imagen desde la última.
  imagenSiguiente() {
    if (this.imagenesCarrusel.length === 0) {
      return;
    }

    this.imagenActiva = (this.imagenActiva + 1) % this.imagenesCarrusel.length;
  }

  cerrarInfo() {
    // Evita iniciar dos cierres al mismo tiempo o cerrar un modal que ya no existe.
    if (this.hechoAmpliado === null || this.cerrandoInfo) {
      return;
    }

    // Activa las clases CSS de salida antes de retirar el modal del DOM.
    this.cerrandoInfo = true;
    this.cierreInfoTimeout = setTimeout(() => {
      // Espera a que termine la animación y luego libera el hecho ampliado.
      this.hechoAmpliado = null;
      this.cerrandoInfo = false;
      this.cierreInfoTimeout = undefined;
      this.changeDetector.detectChanges();
    }, 220);
  }
  // Cierra la tarjeta
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

  agrandarimg(){
    this.imagenAgrandada = !this.imagenAgrandada;
  }
}
