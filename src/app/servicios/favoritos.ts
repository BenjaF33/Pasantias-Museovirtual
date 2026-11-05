import { Injectable } from '@angular/core';
import { Hecho } from '../models/hechos';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  hechos: Hecho[] = [];

  obtenerHechos() {
    return this.hechos;
  }
  
  agregarHecho(hecho: Hecho) {
    if (!this.contieneHecho(hecho)) {
      this.hechos.push(hecho);
    }
  }

  eliminarHecho(hecho: Hecho) {
    const index = this.hechos.findIndex(
      guardado => guardado.anio === hecho.anio && guardado.titulo === hecho.titulo,
    );
    if (index !== -1) {
      this.hechos.splice(index, 1);
    }
  }

  alternarHecho(hecho: Hecho) {
    if (this.contieneHecho(hecho)) {
      this.eliminarHecho(hecho);
      return;
    }

    this.agregarHecho(hecho);
  }

  contieneHecho(hecho: Hecho): boolean {
    return this.hechos.some(
      guardado => guardado.anio === hecho.anio && guardado.titulo === hecho.titulo,
    );
  }
  
}
