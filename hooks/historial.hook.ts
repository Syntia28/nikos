import { HistorialCompraWithId, ItemHistorialConProducto } from '@/interfaces/historial';
import { ProductoWithId } from '@/interfaces/producto';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useHistorial(user: User | null) {
  const { searchByField, getById } = useCrudFireStorage();

  const [historial, setHistorial] = useState<HistorialCompraWithId[]>([]);
  const [loading, setLoading] = useState(false);

  // Mapear productos del historial con sus datos actuales
  const mapearProductosHistorial = async (
    compra: HistorialCompraWithId
  ): Promise<HistorialCompraWithId> => {
    const itemsConProductos: ItemHistorialConProducto[] = [];

    for (const item of compra.items) {
      const productResult = await getById<ProductoWithId>(item.idProducto, 'productos');

      if (productResult.success && productResult.data) {
        itemsConProductos.push({
          ...item,
          producto: productResult.data,
        });
      } else {
        // Si el producto ya no existe, mostramos un placeholder
        console.warn(`Producto ${item.idProducto} no encontrado en historial`);
        itemsConProductos.push({
          ...item,
          producto: {
            id: item.idProducto,
            nombre: '[Producto eliminado]',
            descripcion: 'Este producto ya no está disponible',
            precio: 0,
            stock: 0,
            imagenUrl: '',
            tamanio: '',
            createdAt: new Date(),
          },
        });
      }
    }

    return {
      ...compra,
      items: itemsConProductos as any, // TypeScript trick para mantener compatibilidad
    };
  };

  // Cargar historial del usuario
  const loadHistorial = async () => {
    if (!user) {
      setHistorial([]);
      return;
    }

    setLoading(true);
    try {
      const result = await searchByField<HistorialCompraWithId>('user_id', user.uid, 'historial');

      if (result.success) {
        // Ordenar por fecha descendente (más reciente primero)
        const sortedHistorial = result.data.sort((a, b) => {
          const dateA = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
          const dateB = b.fecha instanceof Date ? b.fecha : new Date(b.fecha);
          return dateB.getTime() - dateA.getTime();
        });

        // Mapear productos de cada compra
        const historialConProductos = await Promise.all(
          sortedHistorial.map((compra) => mapearProductosHistorial(compra))
        );

        setHistorial(historialConProductos);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial al iniciar o cuando cambie el usuario
  useEffect(() => {
    loadHistorial();
  }, [user]);

  return {
    historial,
    loading,
    loadHistorial,
  };
}
