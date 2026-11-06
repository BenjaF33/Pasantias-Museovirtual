export class Hecho {
  constructor(
  public id_evento: number,
  public anio: string,
  public img: string[],
  public titulo: string,
  public descripcion: string,
  public info: string,
  ) {}
}


export interface Hecho {
  id_evento: number;
  anio: string;
  img: string[];
  titulo: string;
  descripcion: string;
  info: string;
}
