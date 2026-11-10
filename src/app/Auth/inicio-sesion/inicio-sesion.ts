import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../servicios/auth-service';

@Component({
  selector: 'app-inicio-sesion',
  imports: [FormsModule, RouterLink],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion {
  email = '';
  clave = '';
  error = '';
  cargando = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ingresar(): void {
    if (this.cargando) {
      return;
    }

    this.error = '';
    this.cargando = true;
    this.authService.login(this.email.trim(), this.clave).subscribe({
      next: () => {
        this.cargando = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
          void this.router.navigateByUrl(returnUrl);
          return;
        }
        void this.router.navigate([this.authService.esAdmin() ? '/panel-admin' : '/inicio']);
      },
      error: () => {
        this.cargando = false;
        this.error = 'Email o contraseña incorrectos.';
        this.changeDetector.markForCheck();
      },
    });
  }
}
