import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Ticket as TicketData } from '../models/api';
import { NotificacionesService } from '../servicios/notificaciones';
import { TicketsService } from '../servicios/tickets';
import { Ticket } from './ticket';

describe('Ticket', () => {
  const ticket: TicketData = {
    numero_ticket: 'T-12',
    id_compra: 12,
    pdf_path: 'tickets/12.pdf',
    fecha: '2026-11-14',
  };
  let ticketsService: {
    ver: ReturnType<typeof vi.fn>;
    generar: ReturnType<typeof vi.fn>;
    descargar: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    ticketsService = {
      ver: vi.fn(),
      generar: vi.fn(),
      descargar: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Ticket],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '12' } } } },
        { provide: TicketsService, useValue: ticketsService },
        { provide: NotificacionesService, useValue: { mostrar: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('creates a ticket when it is missing, then loads it', () => {
    ticketsService.ver
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 404 })))
      .mockReturnValueOnce(of(ticket));
    ticketsService.generar.mockReturnValue(of({ mensaje: 'Ticket generado', numero_ticket: 'T-12' }));

    const fixture = TestBed.createComponent(Ticket);
    fixture.detectChanges();

    expect(ticketsService.generar).toHaveBeenCalledWith(12);
    expect(ticketsService.ver).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.ticket).toEqual(ticket);
  });

  it('does not try to generate a ticket for other API errors', () => {
    ticketsService.ver.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    const fixture = TestBed.createComponent(Ticket);
    fixture.detectChanges();

    expect(ticketsService.generar).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error).toContain('No se pudo encontrar');
  });
});
