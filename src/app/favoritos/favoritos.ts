import { HttpErrorResponse } from '@angular/common/http';
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
    private readonly authService: AuthService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.estaLogueado = this.authService.estaLogueado();
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
      error: (error: unknown) => {
        this.error = this.mensajeErrorAlCargar(error);
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.authService.logout();
          this.estaLogueado = false;
        }
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  private mensajeErrorAlCargar(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const mensaje = error.error?.error;
      if (error.status === 0) {
        return 'No se pudo conectar con la API. Comprueba que Apache y la API PHP estén iniciados.';
      }
      if (error.status === 401) {
        const detalle = typeof mensaje === 'string' ? `: ${mensaje}` : '';
        return `Tu sesión fue rechazada (HTTP 401)${detalle}. Inicia sesión nuevamente.`;
      }
      if (typeof mensaje === 'string') {
        return `No se pudieron cargar tus favoritos (HTTP ${error.status}): ${mensaje}`;
      }
      return `No se pudieron cargar tus favoritos (HTTP ${error.status}).`;
    }

    return 'No se pudieron cargar tus favoritos por un error inesperado.';
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
