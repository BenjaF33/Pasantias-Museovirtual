import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {


  // Guarda el acontecimiento que el usuario seleccionó
  hechoSeleccionado: any = null;
  hechoAmpliado: any = null;

  // Acontecimientos de la línea del tiempo
  hechos = [
    { anio: 'Antes de 1900', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'El origen del Valle', descripcion: 'Las aguas y los pueblos originarios construyen el primer capítulo de este territorio.', info: 'Antes de la fundación de la ciudad, el valle estaba marcado por el río, sus islas y una naturaleza abundante. Las comunidades originarias conocían el territorio y se movían siguiendo los ciclos del agua y de la tierra.' },
    { anio: '1900', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La llegada de nuevos pobladores', descripcion: 'La llegada de nuevos pobladores transforma el paisaje y abre las primeras chacras del valle.', info: 'Con la llegada de nuevos pobladores comenzaron a organizarse las primeras chacras. El trabajo sobre la tierra y el aprovechamiento del agua dieron forma a una comunidad agrícola que crecería durante las décadas siguientes.' },
    { anio: '1902', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La llegada del ferrocarril', descripcion: 'La conexión del ferrocarril llega al Alto Valle y Cipolletti se convierte en un punto de encuentro y producción.', info: 'El ferrocarril permitió conectar el Alto Valle con otras ciudades y facilitó el traslado de personas, herramientas y productos. La estación impulsó el comercio y aceleró el crecimiento de Cipolletti.' },
    { anio: '1903', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Fundación de la ciudad', descripcion: 'La fundación de la ciudad toma su nombre en homenaje al ingeniero César Cipolletti y afirma su identidad.', info: 'La ciudad adoptó el nombre Cipolletti en homenaje al ingeniero italiano que estudió las posibilidades de riego del río Neuquén. Su legado está ligado al desarrollo del valle y a la transformación del desierto en una zona productiva.' },
    { anio: '1904', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'La fruticultura', descripcion: 'La cosecha y la fruticultura se vuelven motores económicos y el valle encuentra una nueva manera de crecer.', info: 'La producción de frutas encontró en el clima y en los sistemas de riego las condiciones ideales para desarrollarse. Las chacras, las plantas de empaque y las temporadas de cosecha pasaron a ser parte central de la vida local.' },
    { anio: 'Actualidad', img: 'assets/Bombilla Acero Quirúrgico.png', titulo: 'Cipolletti en la actualidad', descripcion: 'La ciudad continúa creciendo y conserva parte de la historia construida a lo largo de los años.', info: 'Hoy Cipolletti combina su identidad productiva con nuevos barrios, espacios culturales, instituciones educativas y una comunidad diversa. La ciudad sigue creciendo mientras conserva la memoria de su valle.' }
  ];


  // Se ejecuta cuando hacemos clic en un punto
  mostrarHecho(h: any) {
    this.hechoSeleccionado = h;
  }

  mostrarInfo(h: any) {
    this.hechoAmpliado = h;
  }

  cerrarInfo() {
    this.hechoAmpliado = null;
  }
  // Cierra la tarjeta
  cerrarCard() {
    this.hechoSeleccionado = null;
  }


}
