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
  hechoAmpliado: any = null;
  cerrandoCard = false;
  cerrandoInfo = false;
  private cierreCardTimeout: ReturnType<typeof setTimeout> | undefined;
  private cierreInfoTimeout: ReturnType<typeof setTimeout> | undefined;

  // Acontecimientos de la línea del tiempo
  hechos = [
    { anio: 'Antes de 1900', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'El origen del Valle', descripcion: 'Las aguas y los pueblos originarios construyen el primer capítulo de este territorio.', info: 'Antes de la fundación de la ciudad, el valle estaba marcado por el río, sus islas y una naturaleza abundante. Las comunidades originarias conocían el territorio y se movían siguiendo los ciclos del agua y de la tierra.' },
    { anio: '1900', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La llegada de nuevos pobladores', descripcion: 'La llegada de nuevos pobladores transforma el paisaje y abre las primeras chacras del valle.', info: 'Con la llegada de nuevos pobladores comenzaron a organizarse las primeras chacras. El trabajo sobre la tierra y el aprovechamiento del agua dieron forma a una comunidad agrícola que crecería durante las décadas siguientes.' },
    { anio: '1902', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La llegada del ferrocarril', descripcion: 'La conexión del ferrocarril llega al Alto Valle y Cipolletti se convierte en un punto de encuentro y producción.', info: 'El ferrocarril permitió conectar el Alto Valle con otras ciudades y facilitó el traslado de personas, herramientas y productos. La estación impulsó el comercio y aceleró el crecimiento de Cipolletti.' },
    { anio: '1903', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Fundación de la ciudad', descripcion: 'La fundación de la ciudad toma su nombre en homenaje al ingeniero César Cipolletti y afirma su identidad.', info: 'La ciudad adoptó el nombre Cipolletti en homenaje al ingeniero italiano que estudió las posibilidades de riego del río Neuquén. Su legado está ligado al desarrollo del valle y a la transformación del desierto en una zona productiva.' },
    { anio: '1904', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La fruticultura', descripcion: 'La cosecha y la fruticultura se vuelven motores económicos y el valle encuentra una nueva manera de crecer.', info: 'La producción de frutas encontró en el clima y en los sistemas de riego las condiciones ideales para desarrollarse. Las chacras, las plantas de empaque y las temporadas de cosecha pasaron a ser parte central de la vida local.' },
    { anio: '1910', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Las obras de riego', descripcion: 'Los canales y acequias transforman el paisaje y permiten ampliar las zonas productivas.', info: 'La construcción y el mantenimiento de canales de riego organizaron el territorio y hicieron posible que más familias trabajaran la tierra. El agua se convirtió en una pieza fundamental de la identidad del valle.' },
    { anio: '1920', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'El crecimiento de las chacras', descripcion: 'Las chacras se expanden y la vida rural se consolida alrededor de la producción frutícola.', info: 'Durante estas décadas crecieron las plantaciones y se fortalecieron los vínculos entre productores, trabajadores y comercios. Las chacras pasaron a definir buena parte de la vida cotidiana de Cipolletti.' },
    { anio: '1930', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Los galpones de empaque', descripcion: 'Los galpones de empaque acompañan el crecimiento de la producción y conectan la fruta con nuevos mercados.', info: 'El empaque permitió clasificar y preparar la fruta para su traslado. Estos espacios reunieron trabajo, tecnología y organización, y se volvieron parte visible del paisaje productivo de la ciudad.' },
    { anio: '1960', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La expansión urbana', descripcion: 'La ciudad crece, aparecen nuevos barrios y la comunidad amplía sus espacios de encuentro.', info: 'El crecimiento de la población impulsó la apertura de calles, la construcción de viviendas y la creación de nuevas instituciones. Cipolletti comenzó a combinar con mayor fuerza su tradición rural con una vida urbana en expansión.' },
    { anio: '1990', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Nuevos espacios para la comunidad', descripcion: 'La ciudad fortalece sus instituciones, sus espacios culturales y las propuestas para sus vecinos.', info: 'La memoria local comenzó a encontrar nuevos espacios de encuentro y difusión. Escuelas, bibliotecas, clubes y centros culturales ayudaron a preservar las historias que forman parte de la identidad cipoleña.' },
    { anio: 'Actualidad', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Cipolletti en la actualidad', descripcion: 'La ciudad continúa creciendo y conserva parte de la historia construida a lo largo de los años.', info: 'Hoy Cipolletti combina su identidad productiva con nuevos barrios, espacios culturales, instituciones educativas y una comunidad diversa. La ciudad sigue creciendo mientras conserva la memoria de su valle.' }
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
    clearTimeout(this.cierreInfoTimeout);
    this.cierreInfoTimeout = undefined;
    this.cerrandoInfo = false;
    this.hechoAmpliado = h;
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
