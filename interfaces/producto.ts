export interface Producto {
  nombre: string;
  descripcion: string;
  tamanio: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  createdAt: Date;
  calificaciones?: CalificacionProducto[];
   ratingPromedio?: number;
  totalCalificaciones?: number;
}

export interface ProductoWithId extends Producto {
  id: string;
}
export interface CalificacionProducto {
  productoId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  score: number;
  comment?: string;
  fecha: any;
  compraId: string;
}

