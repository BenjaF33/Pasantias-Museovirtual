export interface Hecho {
  id_evento: number;
  anio: string;
  img: string[];
  titulo: string;
  descripcion: string;
  descripcion_larga: string;
}

export type BorradorEvento = Omit<Hecho, 'id_evento'> & {
  img: string[];
};
