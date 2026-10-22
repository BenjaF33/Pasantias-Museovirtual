import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected readonly title = signal('MuseoVirtual');
  protected readonly menuAbierto = signal(false);

  protected alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu() {
    this.menuAbierto.set(false);
  }
}
