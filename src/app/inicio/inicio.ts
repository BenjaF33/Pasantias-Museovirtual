import { ChangeDetectorRef, Component, inject } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {


  private readonly changeDetector = inject(ChangeDetectorRef);

  // Guarda el acontecimiento que el usuario seleccionó
  hechoSeleccionado: any = null;
  // Hecho que se muestra en la ventana ampliada; null significa que el modal está cerrado.
  hechoAmpliado: any = null;
  // Índice de la foto visible actualmente dentro del carrusel.
  imagenActiva = 0;
  // Imágenes válidas del hecho ampliado; se actualiza cada vez que se abre un hecho.
  imagenesCarrusel: string[] = [];
  cerrandoCard = false;
  cerrandoInfo = false;
  private cierreCardTimeout: ReturnType<typeof setTimeout> | undefined;
  private cierreInfoTimeout: ReturnType<typeof setTimeout> | undefined;

  // Acontecimientos de la línea del tiempo
  hechos = [
    { anio: '1830', img: ['assets/Fotos/1830 Primer ferrocarril de pasajeros Liverpool–Manchester/dibujo ferrocarril.jpg', 'assets/Fotos/1830 Primer ferrocarril de pasajeros Liverpool–Manchester/Primer ferrocarril de pasajeros.jpg'], titulo: 'Primer ferrocarril de pasajeros Liverpool–Manchester', descripcion: 'Se inauguró en Inglaterra el primer ferrocarril de pasajeros del mundo, un acontecimiento que marcó el inicio de una revolución en los transportes. ', info: 'La posibilidad de trasladar personas y mercancías de forma más rápida impulsó el crecimiento económico y urbano en numerosos países. Este avance tecnológico sería fundamental décadas después para el desarrollo ferroviario argentino y la llegada del tren al Alto Valle.'},
    { anio: '1875', img: ['assets/Fotos/1875 Profiliaxis Social Bs.As/Poster concientizacion.jpg', 'assets/Fotos/1875 Profiliaxis Social Bs.As/prostibulo-upscaled-4x.jpg', 'assets/Fotos/1875 Profiliaxis Social Bs.As/prostibulo2.jpg'], titulo: 'Ordenanza de Profilaxis Social en Buenos Aires', descripcion: 'El Reglamento de la Prostitución aprobado en Buenos Aires el 5 de enero de 1875 legalizó y reglamentó los prostíbulos bajo control médico y policial para frenar las enfermedades venéreas.', info: 'La ordenanza regulaba aspectos sanitarios vinculados al ejercicio de la prostitución en Argentina (legalización de burdeles, controles sanitarios, administración femenina, registro e impuestos). Este antecedente permite comprender las futuras reglamentaciones que se aplicarían en Cipolletti durante las primeras décadas del siglo XX.' },
    { anio: '1879', img: ['assets/Fotos/1879 Fortin Confluencia/Tropas arriban la confluencia.jpg', 'assets/Fotos/1879 Fortin Confluencia/Fortin Confluencia.jpg'], titulo: 'Construcción del Fuerte Confluencia', descripcion: 'El Ejército Argentino construyó el Fuerte Confluencia en la zona donde confluyen los ríos Neuquén y Limay. ', info: 'Este puesto militar formó parte del proceso de ocupación y organización territorial de la Patagonia. Aunque tuvo una existencia relativamente breve, es considerado uno de los antecedentes históricos más importantes para el posterior surgimiento de Cipolletti y otras localidades del Alto Valle.' },
    { anio: '1881', img: ['assets/Fotos/1881 Tendido telegráfico por la región/Telegrafo1.JPG'], titulo: 'Tendido telegráfico por la región', descripcion: 'Se realizó el tendido telegráfico que atravesaba la zona donde posteriormente se desarrollaría Cipolletti.', info: 'El telégrafo fue una de las innovaciones tecnológicas más importantes del siglo XIX, ya que permitía transmitir mensajes a grandes distancias en cuestión de minutos. Su instalación ayudó a integrar la Patagonia con el resto del país y facilitó la comunicación entre autoridades, comerciantes y pobladores.' },
    { anio: '1883', img: ['assets/Fotos/1883 Obras telefono/Primer telefono en argentina.jpg'], titulo: 'Obra para el funcionamiento del teléfono.', descripcion: 'Se completó la obra del edificio destinado al funcionamiento del teléfono del tercer fortín.', info: 'Esta infraestructura era necesaria para asegurar el correcto funcionamiento de las comunicaciones en una región que todavía estaba en proceso de organización y poblamiento.' },
    { anio: '1886', img: ['assets/Fotos/1903 Fundacion colonia fernandez oro/FotoFernandezOro.jpg'], titulo: 'Manuel Fernández Oro compra las tierras', descripcion: 'El general Manuel Fernández Oro adquirió importantes extensiones de tierra en la región.', info: 'Esta compra resultó decisiva para el futuro desarrollo de la Colonia Lucinda y de la ciudad de Cipolletti. Fernández Oro impulsó proyectos de colonización, agricultura y urbanización que transformaron profundamente la zona.' },
    { anio: '1888', img: ['assets/Fotos/1888 Juzgado de Paz/Juzgado cartas.jpeg'], titulo: 'Primer Juzgado de Paz del Alto Valle', descripcion: 'Se estableció en General Roca el primer Juzgado de Paz del Alto Valle.', info: 'Esta institución fue fundamental para la organización legal y administrativa de una región que comenzaba a recibir nuevos pobladores. Los juzgados de paz se encargaban de registrar hechos civiles y resolver conflictos cotidianos de la comunidad.' },
    { anio: '1898', img: ['assets/Fotos/1898 Jose Delfino/Jose Delfino.avif'], titulo: 'Llegada de José Delfino', descripcion: 'José Delfino llegó a la región para trabajar en la construcción del ferrocarril.', info: 'Con el tiempo se transformó en una figura destacada del desarrollo comercial local. Su familia participó activamente en emprendimientos que acompañaron el crecimiento de Cipolletti, especialmente a través del Hotel Argentino.' },
    { anio: '1899', img: ['assets/Fotos/1899 Inundacion de marzo/inundacion de Cipolletti.avif'], titulo: 'Inundaciones de marzo', descripcion: 'Fuertes inundaciones destruyeron plantaciones, animales, cultivos y el molino. El resultado fue la quiebra y posterior venta de las tierras al general Fernández Oro. En la zona sur de Cipolletti, lo que hoy conocemos como el barrio La Braña.', info: 'Finalizada la Conquista del Desierto, las tierras de La Confluencia fueron asignadas a la empresa La Vitivinícola Sanjuanina, que aportó divisas para su concreción. Allí comenzó la colonia con asentamientos de personas, animales y cultivos. Incluso se instaló un molino harinero, movido por una noria que tomaba impulso a través del canal de Furque —hoy canal de los Milicos—, que extraía agua del río Neuquén a 200 metros río abajo del actual tercer puente. En marzo de 1899, inundaciones arrasaron con plantaciones, animales, cultivos y el molino. El resultado fue la quiebra y posterior venta de las tierras al general Fernández Oro. Este escenario ocurrió en la zona sur de lo que hoy conocemos como Cipolletti, en el barrio Labraña ' },
    { anio: '1899', img: ['assets/Fotos/1899 Llegada ferrocarril/Ferrocarril2.JPG', 'assets/Fotos/1899 Llegada ferrocarril/Ferrocarril1.JPG'], titulo: 'Llegada del ferrocarril a la región', descripcion: 'La llegada del tren representó uno de los acontecimientos más importantes para el desarrollo del Alto Valle.', info: 'El tren llegó a la región con la inauguración del ramal en Chelforo el 30 de mayo de 1899, acompañado de un banquete en Chimpay. Nuestra estación se denominó sucesivamente Km 1240, Km 1190, Parada o Estación Limay, hasta quedar definitivamente como Estación Cipolletti. El ferrocarril permitió transportar personas, productos agrícolas y materiales de construcción, favoreciendo el crecimiento económico y poblacional. Gracias a esta conexión, la región pudo integrarse de manera más efectiva al resto del país.' },
    { anio: '1899', img: ['assets/Fotos/1899 César Cipolletti estudios de irrigación/irrigación.jpg', 'assets/Fotos/1899 César Cipolletti estudios de irrigación/estudios de irrigación.jpg', 'public/assets/Fotos/1899 César Cipolletti estudios de irrigación/César Cipolletti.jpg'], titulo: 'César Cipolletti entrega el estudio de irrigación', descripcion: 'El ingeniero italiano César Cipolletti presentó los estudios para la irrigación de los ríos Negro y Colorado.Allí señalaba: “En cuanto al agua, la hay suficiente para regar más de un millón de hectáreas, es decir, más de la mitad de todo Egipto con el Nilo”.', info: 'El sueño de Cipolletti era ejecutar obras de riego en el valle superior del río Negro y posibilitar el asentamiento de colonias agrícolas. Como sugerencia imperativa, pedía la instalación de una estación meteorológica para caracterizar el clima y obtener registros diarios de los ríos Neuquén, Limay y Negro. ' }
  ];


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


}
