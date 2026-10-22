import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hecho } from '../models/hechos';
import { FavoritosService } from '../servicios/favoritos';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {
  favoritos: Hecho[] = [];

  constructor(private favoritosService: FavoritosService) {
    this.favoritos = this.favoritosService.obtenerHechos();
  }

  quitarFavorito(hecho: Hecho) {
    this.favoritosService.eliminarHecho(hecho);
    this.favoritos = this.favoritosService.obtenerHechos();
  }

  manejarErrorImagen(event: Event) {
    const imagen = event.target;
    if (imagen instanceof HTMLImageElement) {
      imagen.src = '/assets/puente ferroviario.jpg';
    }
  }
}
