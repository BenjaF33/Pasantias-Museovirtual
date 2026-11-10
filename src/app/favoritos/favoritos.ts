import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Hecho } from '../models/hechos';
import { AuthService } from '../servicios/auth-service';
import { FavoritosService } from '../servicios/favoritos';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos implements OnInit {
  favoritos: Hecho[] = [];
  estaLogueado = false;
  cargando = false;
  error = '';

  constructor(
    private readonly favoritosService: FavoritosService,
    private readonly notificaciones: NotificacionesService,
    authService: AuthService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.estaLogueado = authService.estaLogueado();
  }

  ngOnInit(): void {
    if (this.estaLogueado) {
      this.cargarFavoritos();
    }
  }

  cargarFavoritos(): void {
    this.cargando = true;
    this.error = '';
    this.favoritosService.listar().subscribe({
      next: favoritos => {
        this.favoritos = favoritos;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar tus favoritos. Inténtalo nuevamente.';
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  async quitarFavorito(hecho: Hecho): Promise<void> {
    const confirmar = await this.notificaciones.confirmarEliminacion(
      '¿Quieres eliminar este favorito?',
    );
    if (!confirmar) {
      return;
    }

    this.favoritosService.eliminar(hecho.id_evento).subscribe({
      next: () => {
        this.notificaciones.mostrar('Eliminado de favoritos', 'info');
        this.cargarFavoritos();
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.notificaciones.mostrar('No se pudo quitar el favorito.', 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  manejarErrorImagen(event: Event): void {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/puente ferroviario.jpg';
    }
  }
}
