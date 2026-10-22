import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {

   eventos: any[] = [];

  obtenerEventos() {
    return this.eventos;
  }
  
  agregarEvento(evento: any) {
    const eventoExistente = this.eventos.find(p => p.id === evento.id);
    if (!eventoExistente) {
      this.eventos.push(evento);
    }
  }

  eliminarEvento(evento: any) {
    const index = this.eventos.findIndex(p => p.id === evento.id);
    if (index !== -1) {
      this.eventos.splice(index, 1);
    }
  }
  
}
