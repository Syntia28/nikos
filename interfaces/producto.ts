export interface Producto {
  nombre: string;
  descripcion: string;
  tamanio: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  createdAt: Date;
}

export interface ProductoWithId extends Producto {
  id: string;
}
