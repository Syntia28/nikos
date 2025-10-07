import { ProductoWithId } from "./producto";

export interface ItemHistorial {
  idProducto: string;
  cantidad: number;
}
export interface ItemHistorialConProducto extends ItemHistorial {
  producto: ProductoWithId;
}
export interface DatosEntrega {
  tipoEntrega: 'delivery' | 'recojo'; // valores predeterminados 
  tipoPago: 'contra-entrega';
  metodoPago: 'efectivo' | 'yape' | 'plin';
  direccion: string;
  telefono: string;
  referencia: string;
  fechaRecojo?: string; // Opcional, solo para recojo en tienda
}
export interface HistorialCompra {
  user_id: string;
  items: ItemHistorial[]; // Solo referencias
  total: number;
  fecha: Date;
  estado: 'completado' | 'cancelado' | 'pendiente' | 'en camino' | 'preparando' | 'listo para recojo';
  datosEntrega: DatosEntrega;
}
export interface HistorialCompraWithId extends HistorialCompra {
  id: string;
}
