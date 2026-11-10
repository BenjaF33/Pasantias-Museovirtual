import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Compra } from '../models/api';
import { ComprasService } from '../servicios/compras';
import { NotificacionesService } from '../servicios/notificaciones';

@Component({
  selector: 'app-compras',
  imports: [RouterLink],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras implements OnInit {
  compras: Compra[] = [];
  cargando = false;
  error = '';

  constructor(
    private readonly comprasService: ComprasService,
    private readonly notificaciones: NotificacionesService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    this.comprasService.historial().subscribe({
      next: compras => {
        this.compras = compras;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudo cargar el historial de compras.';
        this.cargando = false;
        this.notificaciones.mostrar(this.error, 'error');
        this.changeDetector.markForCheck();
      },
    });
  }
}
