export interface Usuario {
  id_usuario: number;
  nombre: string;
  rol: 'user' | 'admin';
}

export interface RespuestaAutenticacion {
  token: string;
  usuario: Usuario;
}

export interface RespuestaApi {
  mensaje: string;
}

export interface ItemCarrito {
  id_producto: number;
  nombre: string;
  imagen: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Compra {
  id_compra: number;
  total: number;
  fecha: string;
  nombre?: string;
  email?: string;
}

export interface Ticket {
  numero_ticket: string;
  id_compra: number;
  pdf_path: string;
  fecha: string;
}

export interface RespuestaCompra extends RespuestaApi {
  id_compra: number;
}

export interface RespuestaTicket extends RespuestaApi {
  numero_ticket: string;
}
