export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    tamaño: string;
    precio: number;
    imagenUrl: string;
    stock: number;
    createdAt: Date;
}