import { ProductoWithId } from "./producto";

export interface ItemCarrito {
  idProducto: string;
  cantidad: number;
}
export interface ItemCarritoConProducto extends ItemCarrito {
  producto: ProductoWithId;
}
export interface Carrito {
  user_id: string;
  items: ItemCarrito[];
  fecha: Date;
}
export interface CarritoWithId extends Carrito {
  id: string;
}
