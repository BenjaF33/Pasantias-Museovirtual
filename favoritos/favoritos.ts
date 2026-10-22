import { Component } from '@angular/core';
import { FavoritosService } from '../servicios/favoritos';

@Component({
  selector: 'app-favoritos',
  imports: [],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos {
  eventos: any[] = [];

  constructor(
  private favoritosService: FavoritosService,
  ){}
  
  ngOnInit(){
  this.eventos = this.favoritosService.obtenerEventos();
  }

  eliminar(evento: any){
  this.favoritosService.eliminarEvento(evento);
  }
}
