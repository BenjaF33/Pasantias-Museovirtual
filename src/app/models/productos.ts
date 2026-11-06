export class Producto {
    constructor(
    public id: number,
    public nombre: string,
    public descripcion: string,
    public precio: number,
    public stock: number,
    public cantidad: number,
    public imagen: string,
    ) {}
}


export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    cantidad: number;
    imagen: string;
}