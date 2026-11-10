import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../servicios/auth-service';
import { TemaService } from '../../servicios/tema';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  readonly tema = inject(TemaService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly title = signal('MuseoVirtual');
  protected readonly menuAbierto = signal(false);

  protected alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu() {
    this.menuAbierto.set(false);
  }

  salir(): void {
    this.auth.logout();
    this.cerrarMenu();
    void this.router.navigate(['/inicio-sesion']);
  }
}
