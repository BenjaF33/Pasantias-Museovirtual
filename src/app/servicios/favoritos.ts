import { Injectable } from '@angular/core';
import { Hecho } from '../models/hechos';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private readonly claveStorage = 'favoritos-museo-virtual';
  hechos: Hecho[] = [];

  constructor() {
    this.hechos = this.leerDesdeStorage();
  }

  obtenerHechos(): Hecho[] {
    this.hechos = this.leerDesdeStorage();
    return this.hechos;
  }

  agregarHecho(hecho: Hecho): void {
    if (this.contieneHecho(hecho)) {
      return;
    }

    this.hechos.push(hecho);
    this.guardarEnStorage();
  }

  eliminarHecho(hecho: Hecho): void {
    this.hechos = this.hechos.filter(
      guardado => !(guardado.anio === hecho.anio && guardado.titulo === hecho.titulo),
    );
    this.guardarEnStorage();
  }

  alternarHecho(hecho: Hecho): void {
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

  private leerDesdeStorage(): Hecho[] {
    try {
      const datos = localStorage.getItem(this.claveStorage);
      return datos ? JSON.parse(datos) as Hecho[] : [];
    } catch {
      return [];
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(this.claveStorage, JSON.stringify(this.hechos));
    } catch {
      // Ignorar errores de storage si el navegador no lo permite.
    }
  }
}
