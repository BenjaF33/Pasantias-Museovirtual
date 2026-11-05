import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hecho } from '../models/hechos';
<<<<<<< HEAD
=======
import { AuthService } from '../servicios/auth-service';
>>>>>>> a2e2020069545eb7bd69a3b2ba237f6f792b9deb
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {
  favoritos: Hecho[] = [];
<<<<<<< HEAD
=======
  estaLogueado: boolean;
>>>>>>> a2e2020069545eb7bd69a3b2ba237f6f792b9deb

  constructor(
    private favoritosService: FavoritosService,
    private notificaciones: NotificacionesService,
    private changeDetector: ChangeDetectorRef,
<<<<<<< HEAD
  ) {
    this.favoritos = this.favoritosService.obtenerHechos();
=======
    authService: AuthService,
  ) {
    this.favoritos = this.favoritosService.obtenerHechos();
    this.estaLogueado = authService.estaLogueado();
>>>>>>> a2e2020069545eb7bd69a3b2ba237f6f792b9deb
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
