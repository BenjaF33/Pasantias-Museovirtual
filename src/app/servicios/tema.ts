import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemaService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'museo-virtual-tema';
  readonly modoOscuro = signal(this.obtenerPreferenciaInicial());

  constructor() {
    this.aplicarTema(this.modoOscuro());
  }

  alternar(): void {
    const nuevoModoOscuro = !this.modoOscuro();
    this.document.defaultView?.localStorage.setItem(
      this.storageKey,
      nuevoModoOscuro ? 'oscuro' : 'claro',
    );
    this.modoOscuro.set(nuevoModoOscuro);
    this.aplicarTema(nuevoModoOscuro);
  }

  private obtenerPreferenciaInicial(): boolean {
    const preferenciaGuardada = this.document.defaultView?.localStorage.getItem(this.storageKey);
    if (preferenciaGuardada === 'oscuro') {
      return true;
    }
    if (preferenciaGuardada === 'claro') {
      return false;
    }

    return false;
  }

  private aplicarTema(modoOscuro: boolean): void {
    const raiz = this.document.documentElement;
    raiz.dataset['theme'] = modoOscuro ? 'dark' : 'light';
    raiz.style.colorScheme = modoOscuro ? 'dark' : 'light';
  }
}
