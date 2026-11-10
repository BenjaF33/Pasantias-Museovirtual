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
  urlPdf = '';
  cargando = false;
  error = '';

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
        this.urlPdf = `${this.ticketsService.baseArchivos}${ticket.pdf_path.replace(/^\/+/, '')}`;
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
}
