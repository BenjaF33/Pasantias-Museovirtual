import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../servicios/auth-service';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  nombre = '';
  email = '';
  clave = '';
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  registrar(): void {
    if (this.cargando) {
      return;
    }

    this.error = '';
    this.cargando = true;
    this.authService.registro({
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      contraseña: this.clave,
    }).subscribe({
      next: () => {
        this.cargando = false;
        void this.router.navigate(['/inicio-sesion']);
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo completar el registro. Revisa si el correo ya está registrado.';
        this.changeDetector.markForCheck();
      },
    });
  }
}
