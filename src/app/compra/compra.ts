import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ItemCarrito } from '../models/api';
import { AuthService } from '../servicios/auth-service';
import { CarritoService } from '../servicios/carrito';
import { ComprasService } from '../servicios/compras';
import { NotificacionesService } from '../servicios/notificaciones';
import { TicketsService } from '../servicios/tickets';

@Component({
  selector: 'app-compra',
  imports: [RouterLink],
  templateUrl: './compra.html',
  styleUrl: './compra.css',
})
export class Compra implements OnInit {
  items: ItemCarrito[] = [];
  cargando = false;
  finalizando = false;
  error = '';

  constructor(
    private readonly carritoService: CarritoService,
    private readonly comprasService: ComprasService,
    private readonly ticketsService: TicketsService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificaciones: NotificacionesService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.authService.estaLogueado()) {
      void this.router.navigate(['/inicio-sesion']);
      return;
    }

    this.cargando = true;
    this.carritoService.ver().subscribe({
      next: items => {
        this.items = items;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudo cargar el resumen de compra.';
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  get total(): number {
    return this.items.reduce(
      (suma, item) => suma + item.cantidad * Number(item.precio_unitario),
      0,
    );
  }

  confirmarCompra(): void {
    if (this.finalizando || this.items.length === 0) {
      return;
    }

    this.finalizando = true;
    this.error = '';
    this.comprasService.finalizar().subscribe({
      next: compra => {
        this.ticketsService.generar(compra.id_compra).subscribe({
          next: () => void this.router.navigate(['/paginas/ticket', compra.id_compra]),
          error: () => {
            this.finalizando = false;
            this.error = 'La compra se registró, pero no se pudo generar el ticket. Revisa tu historial.';
            this.notificaciones.mostrar(this.error, 'error');
            this.changeDetector.markForCheck();
          },
        });
      },
      error: () => {
        this.finalizando = false;
        this.error = 'No se pudo confirmar la compra. Revisa el carrito e inténtalo nuevamente.';
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }
}
