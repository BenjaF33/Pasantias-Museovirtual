import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TemaService } from '../../servicios/tema';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  readonly tema = inject(TemaService);
  protected readonly title = signal('MuseoVirtual');
  protected readonly menuAbierto = signal(false);

  protected alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu() {
    this.menuAbierto.set(false);
  }
}
