import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Ticket as TicketData } from '../models/api';
import { NotificacionesService } from '../servicios/notificaciones';
import { TicketsService } from '../servicios/tickets';

@Component({
  selector: 'app-ticket',
  imports: [RouterLink],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css',
})
export class Ticket implements OnInit {
  ticket: TicketData | null = null;
  cargando = false;
  descargando = false;
  error = '';
  errorDescarga = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ticketsService: TicketsService,
    private readonly notificaciones: NotificacionesService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idCompra = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(idCompra) || idCompra <= 0) {
      this.error = 'El número de compra no es válido.';
      return;
    }

    this.cargando = true;
    this.ticketsService.ver(idCompra).subscribe({
      next: ticket => {
        this.ticket = ticket;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudo encontrar el ticket de esta compra.';
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }

  descargarPdf(): void {
    const ticket = this.ticket;
    if (!ticket || this.descargando) {
      return;
    }

    this.descargando = true;
    this.ticketsService.descargar(ticket.id_compra).subscribe({
      next: archivo => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `${ticket.numero_ticket}.pdf`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.descargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.errorDescarga = 'No se pudo descargar el ticket PDF.';
        this.notificaciones.mostrar(this.errorDescarga, 'error');
        this.descargando = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
