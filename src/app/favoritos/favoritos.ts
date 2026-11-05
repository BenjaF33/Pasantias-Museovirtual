import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hecho } from '../models/hechos';
import { AuthService } from '../servicios/auth-service';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {
  favoritos: Hecho[] = [];
  estaLogueado = false;

  constructor(
    private readonly favoritosService: FavoritosService,
    private readonly notificaciones: NotificacionesService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly authService: AuthService,
  ) {
    this.favoritos = this.favoritosService.obtenerHechos();
    this.estaLogueado = this.authService.estaLogueado();
  }

  async quitarFavorito(hecho: Hecho): Promise<void> {
    const eraFavorito = this.favoritosService.contieneHecho(hecho);
    if (!eraFavorito) {
      return;
    }

    const confirmar = await this.notificaciones.confirmarEliminacion(
      '¿Quieres eliminar este favorito?',
    );
    if (!confirmar) {
      return;
    }

    this.favoritosService.eliminarHecho(hecho);
    this.favoritos = this.favoritosService.obtenerHechos();
    this.changeDetector.detectChanges();
    this.notificaciones.mostrar('Eliminado de favoritos', 'info');
  }

  manejarErrorImagen(event: Event) {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/puente ferroviario.jpg';
    }
  }
}
